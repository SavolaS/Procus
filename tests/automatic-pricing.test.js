import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { analyzePortfolio } from '../src/automatic-pricing.js';
import { bomByProductId } from '../src/bom-data.js';
import { products } from '../src/data.js';

const asOf = '2026-09-19T23:59:59.000Z';
const steelId = 'STATFIN:13m8:241.2.thi-pisteluku21';
const copperId = 'STATFIN:13m8:2444.2.thi-pisteluku21';
const clone = value => structuredClone(value);
function snapshots(steelRatio = 0.8, copperRatio = 1.2) {
  return Object.fromEntries([[steelId, steelRatio], [copperId, copperRatio]].map(([id, ratio]) => [id, {
    id, sourceUrl: 'https://pxdata.stat.fi/PxWeb/api/v1/en/StatFin/thi/13m8.px',
    unit: 'Index, 2021=100', currency: 'EUR', geography: 'FI', retrievedAt: '2026-09-19T07:00:00.000Z',
    observations: [{ period: '2025-08', value: 100 }, { period: '2026-07', value: 100 * ratio }],
  }]));
}
const product = id => clone(products.find(row => row.id === id));
function fullSnapshots() {
  const series = snapshots();
  const values = [100, 102, 97, 105, 103, 109, 107, 111, 108, 114, 113, 120];
  for (const source of Object.values(series)) source.observations = values.map((value, i) => ({
    period: new Date(Date.UTC(2025, 7 + i, 1)).toISOString().slice(0, 7), value,
  }));
  return series;
}

test('automatic BOM comparison flags a gap above the conservative scenario endpoint', () => {
  const part = product('NF-101');
  const result = analyzePortfolio([part], snapshots(), { asOf })[part.id];
  assert.equal(result.status, 'review_price');
  assert.equal(result.scenario.baseline.unitPrice, part.history[0]);
  assert.equal(result.scenario.baseline.period, '2025-10');
  assert.equal(result.scenario.targetPeriod, '2026-09');
  assert.equal(result.scenario.contributions[0].base.observations[0].period, '2025-08');
  assert.equal(result.scenario.contributions[0].target.observations[0].period, '2026-07');
  assert.equal(result.scenario.contributions[0].lagMonths, 2);
  assert.equal(result.priceGap.low, part.price - result.scenario.range.high);
  assert.ok(result.priceGap.low > result.threshold);
  assert.ok(result.priceGap.low <= result.priceGap.central && result.priceGap.central <= result.priceGap.high);
  assert.match(result.explanation, /assumed BOM inputs/);
  assert.match(result.nextStep, /supplier/);
  assert.equal(result.dataMode, 'demo_bom_real_indices');
  assert.equal(result.bom.reviewStatus, 'prototype_assumption');
  assert.equal(result.analyzedAt, asOf);
  assert.equal(result.savings, undefined);
});

test('prices within, below or insignificantly above the scenario do not trigger a review', () => {
  const part = product('NF-355');
  const series = snapshots(1.1);
  const seed = analyzePortfolio([part], series, { asOf })[part.id];
  for (const price of [seed.scenario.range.low - 0.1, seed.scenario.range.central, seed.scenario.range.high,
    seed.scenario.range.high + 0.005]) {
    const result = analyzePortfolio([{ ...part, price }], series, { asOf })[part.id];
    assert.equal(result.status, 'no_cost_gap');
    assert.match(result.explanation, /does not exceed/);
    assert.equal(result.scenario.status, 'scenario');
  }
});

test('unsupported aluminium and unknown BOMs do not inherit steel mappings or existing targets', () => {
  const parts = [product('TM-105'), product('VP-045'), { id: '__proto__', price: 100, history: [80] }];
  const results = analyzePortfolio(parts, snapshots(), { asOf });
  for (const part of parts) {
    assert.equal(results[part.id].status, 'insufficient_evidence');
    assert.equal(results[part.id].scenario, null);
    assert.equal(results[part.id].priceGap, null);
    assert.equal(results[part.id].bom, null);
    assert.deepEqual(results[part.id].trend, []);
    assert.match(results[part.id].nextStep, /BOM/);
  }
});

test('missing configured snapshot or required month blocks only affected parts', () => {
  const parts = [product('NF-101'), product('LE-064')];
  const series = snapshots();
  delete series[steelId];
  let result = analyzePortfolio(parts, series, { asOf });
  assert.equal(result['NF-101'].status, 'insufficient_evidence');
  assert.match(result['NF-101'].issues[0], /Required index snapshot unavailable/);
  assert.equal(result['LE-064'].scenario.status, 'scenario');
  series[steelId] = snapshots()[steelId];
  series[steelId].observations.pop();
  result = analyzePortfolio(parts, series, { asOf });
  assert.equal(result['NF-101'].scenario, null);
  assert.match(result['NF-101'].issues[0], /2026-07/);
  assert.equal(result['LE-064'].scenario.status, 'scenario');
});

test('as-of controls reject future periods and later-retrieved snapshots without changing periods', () => {
  const parts = [product('NF-101')];
  for (const timestamp of ['2026-08-19T12:00:00Z', '2026-09-01T12:00:00Z', 'invalid']) {
    const result = analyzePortfolio(parts, snapshots(), { asOf: timestamp })['NF-101'];
    assert.equal(result.status, 'insufficient_evidence');
    assert.equal(result.priceGap, null);
    assert.equal(result.scenario, null);
    assert.ok(result.issues.length);
  }
});

test('incompatible purchase bases and missing prices produce evidence requests', () => {
  for (const overrides of [{ price: null }, { history: [] }, { currency: 'USD' }, { unit: 'kg' },
    { pricePeriod: '2026-08' }, { baselinePeriod: '2025-11' }]) {
    const result = analyzePortfolio([{ ...product('NF-101'), ...overrides }], snapshots(), { asOf })['NF-101'];
    assert.equal(result.status, 'insufficient_evidence');
    assert.equal(result.scenario, null);
  }
});

test('analysis is replayable, preserves inputs and does not use existing savings or targets', () => {
  const parts = clone(products);
  const series = snapshots();
  const originalParts = clone(parts);
  const originalSeries = clone(series);
  const first = analyzePortfolio(parts, series, { asOf });
  assert.deepEqual(analyzePortfolio(parts, series, { asOf }), first);
  assert.deepEqual(parts, originalParts);
  assert.deepEqual(series, originalSeries);
  for (const part of parts) Object.assign(part, { target: 0.01, gapPct: 99, qty: 1, verifiedMonths: 12, status: 'Agreed', signal: null });
  assert.deepEqual(analyzePortfolio(parts, series, { asOf }), first);
  assert.deepEqual(analyzePortfolio(parts, new Map(Object.entries(series)), { asOf }), first);
  first['NF-101'].bom.netMassKg = 999;
  assert.equal(bomByProductId['NF-101'].netMassKg, 3.8);
});

test('published StatFin snapshots support reproducible steel and copper automatic analysis', async () => {
  const loaded = await Promise.all(['steel', 'copper'].map(async name => JSON.parse(await readFile(
    new URL(`../research/data/statfin-fi-${name}.json`, import.meta.url), 'utf8'))));
  const result = analyzePortfolio(products, Object.fromEntries(loaded.map(series => [series.id, series])), { asOf });
  assert.equal(result['NF-101'].status, 'review_price');
  assert.equal(result['NF-118'].status, 'review_price');
  assert.equal(result['NF-355'].status, 'no_cost_gap');
  assert.equal(result['LE-064'].status, 'review_price');
  assert.equal(result['LE-064'].scenario.contributions[0].series, copperId);
  assert.equal(Object.keys(result).length, products.length);
  for (const id of ['NF-101', 'NF-118', 'NF-355', 'LE-064']) {
    assert.equal(result[id].trend.length, 12);
    assert.equal(result[id].trend[0].materialIndex, 100);
    const last = result[id].trend.at(-1);
    assert.equal(last.period, '2026-09');
    assert.equal(last.costScenarioIndex, result[id].scenario.range.central / result[id].scenario.baseline.unitPrice * 100);
  }
});

test('monthly chart aligns paid history and exact lagged index observations on a shared baseline', () => {
  const part = product('NF-101');
  const series = fullSnapshots();
  const result = analyzePortfolio([part], series, { asOf })[part.id];
  assert.equal(result.trend.length, 12);
  assert.deepEqual(result.trend[0], { period: '2025-10', pricePaidIndex: 100, materialIndex: 100,
    costScenarioIndex: 100, costLowIndex: 100, costHighIndex: 100 });
  assert.deepEqual(result.trend.map(row => row.period), ['2025-10', '2025-11', '2025-12', '2026-01',
    '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09']);
  result.trend.forEach((row, i) => {
    assert.equal(row.pricePaidIndex, part.history[i] / part.history[0] * 100);
    assert.equal(row.materialIndex, series[steelId].observations[i].value / 100 * 100);
    assert.ok(row.costLowIndex <= row.costScenarioIndex && row.costScenarioIndex <= row.costHighIndex);
  });
  assert.equal(result.trend[2].materialIndex, 97);
  assert.ok(result.trend[2].costHighIndex < 100);
  assert.ok(result.trend[3].costLowIndex > 100);
  assert.equal(result.trend.at(-1).costLowIndex, result.scenario.range.low / part.history[0] * 100);
  assert.equal(result.trend.at(-1).costHighIndex, result.scenario.range.high / part.history[0] * 100);
});

test('missing or invalid intermediate source data suppresses the chart without changing endpoint analysis', () => {
  const part = product('NF-101');
  const original = fullSnapshots();
  const complete = analyzePortfolio([part], original, { asOf })[part.id];
  for (const change of [series => { series[steelId].observations.splice(4, 1); },
    series => { series[steelId].observations[4].value = null; }]) {
    const series = clone(original); change(series);
    const result = analyzePortfolio([part], series, { asOf })[part.id];
    assert.deepEqual(result.trend, []);
    assert.equal(result.status, complete.status);
    assert.deepEqual(result.scenario, complete.scenario);
    assert.deepEqual(result.priceGap, complete.priceGap);
  }
});

test('incomplete or invalid purchase histories never produce interpolated chart values', () => {
  const original = product('NF-101');
  for (const change of [part => { part.history.pop(); }, part => { part.history.push(part.price); },
    part => { part.history[5] = null; }, part => { part.history[5] = -1; }, part => { part.history[5] = Infinity; }]) {
    const part = clone(original); change(part);
    const result = analyzePortfolio([part], fullSnapshots(), { asOf })[part.id];
    assert.deepEqual(result.trend, []);
    assert.equal(result.scenario.status, 'scenario');
  }
});
