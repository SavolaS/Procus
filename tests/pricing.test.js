import test from 'node:test';
import assert from 'node:assert/strict';
import { bomMaterialCost, repriceBom } from '../src/pricing.js';
import { parseEurostatMetals } from '../src/index-sources.js';

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);
function series(values = [100, 80]) {
  return { id: 'test-material', sourceUrl: 'https://example.org/material', unit: '2021=100', geography: 'FI', currency: 'EUR',
    retrievedAt: '2026-09-19T00:00:00Z', observations: values.map((value, i) => ({ period: ['2025-07', '2026-07'][i], value })) };
}
function fixture() {
  return {
    baseline: { unitPrice: 100, currency: 'EUR', period: '2025-07', source: 'Synthetic purchase record', bomRevision: 'A' },
    targetPeriod: '2026-07', asOf: '2026-09-19T12:00:00Z',
    drivers: [{ id: 'metal', kind: 'cost', baseCost: 40, source: 'Synthetic BOM cost', mappingReason: 'Synthetic exact-match index',
      exposureCurrency: 'EUR', series: series(), lagMonths: 0, windowMonths: 1, passThrough: { low: 0.5, central: 0.75, high: 1 } }],
  };
}

test('BOM accounts for purchased mass, yield and recovered scrap once', () => {
  const cost = bomMaterialCost({ netMassKg: 1.2, yieldRate: 0.8, pricePerKg: 3, recoveryRate: 0.8, scrapPricePerKg: 1 });
  close(cost.grossMassKg, 1.5);
  close(cost.scrapCredit, 0.24);
  close(cost.netCost, 4.26);
  for (const yieldRate of [0, -1, 1.1, NaN]) assert.throws(() => bomMaterialCost({ netMassKg: 1, yieldRate, pricePerKg: 3, recoveryRate: 0, scrapPricePerKg: 0 }));
});

test('BOM rejects overflow instead of returning an infinite cost or NaN', () => {
  assert.throws(() => bomMaterialCost({ netMassKg: 1, yieldRate: 1e-310, pricePerKg: 1,
    recoveryRate: 1, scrapPricePerKg: 1 }), /finite numeric limits/);
});

test('20% material decrease at 40% cost exposure does not become 20% part saving', () => {
  const result = repriceBom(fixture());
  assert.equal(result.status, 'scenario');
  assert.deepEqual(result.range, { low: 92, central: 94, high: 96 });
  assert.equal(result.fixedResidual, 60);
  assert.equal(result.indexedCostShare, 0.4);
  assert.equal(result.contributions[0].base.observations[0].period, '2025-07');
  assert.equal(result.savings, undefined);
});

test('positive movements and negative scrap-credit contributions have correctly ordered ranges', () => {
  const input = fixture();
  input.drivers[0].series = series([100, 120]);
  const up = repriceBom(input);
  assert.deepEqual(up.range, { low: 104, central: 106, high: 108 });
  input.drivers.push({ ...input.drivers[0], id: 'scrap', kind: 'credit', baseCost: 10, parentCostId: 'metal' });
  const withCredit = repriceBom(input);
  close(withCredit.range.low, 102);
  close(withCredit.range.central, 104.5);
  close(withCredit.range.high, 107);
});

test('FX uses quote currency per exposure currency and rejects inverse quotations', () => {
  const input = fixture();
  input.drivers[0].exposureCurrency = 'USD';
  input.drivers[0].series.currency = 'USD';
  input.drivers[0].fxSeries = { ...series([0.9, 1.0]), id: 'EUR-per-USD', unit: 'EUR/USD', baseCurrency: 'USD', quoteCurrency: 'EUR' };
  close(repriceBom(input).contributions[0].ratio, 0.8 / 0.9);
  input.drivers[0].fxSeries.baseCurrency = 'EUR';
  assert.equal(repriceBom(input).status, 'insufficient_evidence');
  delete input.drivers[0].fxSeries;
  assert.equal(repriceBom(input).range, null);
});

test('multi-month FX converts each matching observation before averaging', () => {
  const input = fixture();
  input.baseline.period = '2026-02';
  input.targetPeriod = '2026-03';
  const driver = input.drivers[0];
  Object.assign(driver, { exposureCurrency: 'USD', windowMonths: 2, passThrough: { low: 1, central: 1, high: 1 } });
  driver.series.currency = 'USD';
  driver.series.observations = [
    { period: '2026-01', value: 100 }, { period: '2026-02', value: 200 }, { period: '2026-03', value: 300 },
  ];
  driver.fxSeries = { ...series(), id: 'EUR-per-USD', unit: 'EUR/USD', baseCurrency: 'USD', quoteCurrency: 'EUR',
    observations: [{ period: '2026-01', value: 1 }, { period: '2026-02', value: 2 }, { period: '2026-03', value: 1 }] };
  const result = repriceBom(input);
  assert.equal(result.status, 'scenario');
  close(result.range.central, 116);
  close(result.contributions[0].ratio, 350 / 250);
  assert.deepEqual(result.contributions[0].fx.convertedBase.observations.map(row => row.value), [100, 400]);
  driver.fxSeries.observations.shift();
  assert.equal(repriceBom(input).status, 'insufficient_evidence');
});

test('series currency must support the exposure before applying FX', () => {
  const input = fixture();
  input.drivers[0].exposureCurrency = 'USD';
  input.drivers[0].fxSeries = { ...series([0.9, 1]), baseCurrency: 'USD', quoteCurrency: 'EUR' };
  assert.match(repriceBom(input).issues[0], /series currency/);
  delete input.drivers[0].series.currency;
  assert.equal(repriceBom(input).range, null);
});

test('scrap credits require a cost parent and cannot collectively exceed its purchase cost', () => {
  const input = fixture();
  const scrap = { ...input.drivers[0], id: 'scrap', kind: 'credit', baseCost: 25, parentCostId: 'metal' };
  input.drivers.push(scrap);
  assert.equal(repriceBom(input).status, 'scenario');
  input.drivers.push({ ...scrap, id: 'second-scrap', baseCost: 16 });
  assert.match(repriceBom(input).issues[0], /aggregate credits/);
  input.drivers[2].baseCost = 15;
  assert.equal(repriceBom(input).status, 'scenario');
  scrap.parentCostId = 'missing';
  assert.match(repriceBom(input).issues[0], /parentCostId/);
  scrap.parentCostId = 'second-scrap';
  assert.match(repriceBom(input).issues[0], /parentCostId/);
  delete scrap.parentCostId;
  assert.equal(repriceBom(input).range, null);
});

test('provided publication timestamps must precede retrieval and as-of, and are retained', () => {
  const input = fixture();
  const observation = input.drivers[0].series.observations[1];
  observation.publishedAt = '2026-08-15T00:00:00Z';
  assert.equal(repriceBom(input).contributions[0].target.observations[0].publishedAt, observation.publishedAt);
  observation.publishedAt = '2026-09-19T06:00:00Z';
  assert.match(repriceBom(input).issues[0], /after snapshot retrieval/);
  observation.publishedAt = '2026-09-20T00:00:00Z';
  assert.match(repriceBom(input).issues[0], /after as-of/);
  observation.publishedAt = 'not a timestamp';
  assert.match(repriceBom(input).issues[0], /invalid publication timestamp/);
});

test('lagged arithmetic-average windows use exact periods and require every observation', () => {
  const input = fixture();
  Object.assign(input.drivers[0], { lagMonths: 1, windowMonths: 2 });
  input.drivers[0].series.observations = [
    { period: '2025-05', value: 90 }, { period: '2025-06', value: 110 },
    { period: '2026-05', value: 70 }, { period: '2026-06', value: 90 },
  ];
  close(repriceBom(input).range.central, 94);
  input.drivers[0].series.observations.pop();
  assert.match(repriceBom(input).issues[0], /2026-06/);
});

test('missing values, future knowledge, bad weights and double counting block a numeric answer', () => {
  const mutations = [
    x => { x.drivers[0].series.observations[1].value = null; },
    x => { x.drivers[0].series.observations[0].value = 0; },
    x => { x.asOf = '2026-08-01T00:00:00Z'; },
    x => { x.targetPeriod = '2026-10'; },
    x => { x.drivers[0].baseCost = 101; },
    x => { x.drivers.push(structuredClone(x.drivers[0])); },
    x => { x.drivers[0].passThrough.low = 2; },
    x => { x.drivers[0].series.observations.push(x.drivers[0].series.observations[0]); },
    x => { x.drivers[0].mappingReason = ''; },
    x => { x.baseline.bomRevision = ''; },
  ];
  for (const mutate of mutations) {
    const input = fixture(); mutate(input);
    const result = repriceBom(input);
    assert.equal(result.status, 'insufficient_evidence');
    assert.equal(result.range, null);
    assert.ok(result.issues.length > 0);
  }
});

function dataset() {
  const codes = { freq: 'M', indic_bt: 'PRC_PRR_DOM', nace_r2: 'C24', s_adj: 'NSA', unit: 'I21', geo: 'FI' };
  return { class: 'dataset', id: ['time', ...Object.keys(codes)], size: [3, 1, 1, 1, 1, 1, 1],
    dimension: { ...Object.fromEntries(Object.entries(codes).map(([key, value]) => [key, { category: { index: { [value]: 0 } } }])),
      time: { category: { index: { '2026-08': 2, '2026-06': 0, '2026-07': 1 } } } },
    value: { 0: 107.5, 1: 108 }, status: { 1: 'p' } };
}

test('Eurostat sparse JSON-stat values and flags follow provider indexes, not object order', () => {
  const result = parseEurostatMetals(dataset(), '2026-09-19T00:00:00Z');
  assert.deepEqual(result.observations, [
    { period: '2026-06', value: 107.5, status: null },
    { period: '2026-07', value: 108, status: 'p' },
    { period: '2026-08', value: null, status: null },
  ]);
});

test('Eurostat series identity changes fail instead of mixing geography or base years', () => {
  const input = dataset();
  input.dimension.unit.category.index = { I15: 0 };
  assert.throws(() => parseEurostatMetals(input, '2026-09-19T00:00:00Z'), /unit/);
});
