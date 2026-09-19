import test from 'node:test';
import assert from 'node:assert/strict';
import { statfinDimensions as dim, buildStatfinQuery, parseStatfinMaterials, eurostatMetals } from '../src/index-sources.js';

const retrievedAt = '2026-09-19T12:00:00Z';
function fixture() {
  return {
    class: 'dataset', id: [dim.time, dim.measure, dim.product, dim.market], size: [3, 1, 2, 1],
    updated: '2026-08-24T05:00:00Z',
    dimension: {
      [dim.time]: { category: { index: { '2026M07': 1, '2026M08': 2, '2026M06': 0 } } },
      [dim.product]: { category: { index: { '241': 1, '2444': 0 } } },
      [dim.market]: { category: { index: { '2': 0 } } },
      [dim.measure]: { category: { index: { 'thi-pisteluku21': 0 }, unit: { 'thi-pisteluku21': { base: 'index point' } } } },
    },
    value: { 0: 140, 1: 95, 2: 147.9, 3: 99.5, 4: null }, status: { 2: 'p', 4: '.', 5: '.' },
  };
}

test('StatFin decoding respects reordered axes/categories, sparse cells and observation flags', () => {
  const [steel, copper] = parseStatfinMaterials(fixture(), retrievedAt);
  assert.deepEqual(steel.observations, [
    { period: '2026-06', value: 95, status: null }, { period: '2026-07', value: 99.5, status: null }, { period: '2026-08', value: null, status: '.' },
  ]);
  assert.deepEqual(copper.observations, [
    { period: '2026-06', value: 140, status: null }, { period: '2026-07', value: 147.9, status: 'p' }, { period: '2026-08', value: null, status: '.' },
  ]);
  assert.equal(copper.currency, 'EUR');
  assert.equal(copper.providerUpdatedAt, '2026-08-24T05:00:00Z');
  assert.equal(copper.retrievedAt, retrievedAt);
  assert.equal(copper.sourceType, 'producer_price_index');
  assert.match(copper.limitation, /mapping requires explicit review/);
  assert.equal(eurostatMetals.currency, 'EUR');
});

test('StatFin arrays and product-first stride decode the same observations', () => {
  const input = fixture();
  input.id = [dim.product, dim.time, dim.market, dim.measure];
  input.size = [2, 3, 1, 1];
  input.value = [140, 147.9, null, 95, 99.5, null];
  input.status = { 1: 'p', 2: '.', 5: '.' };
  assert.deepEqual(parseStatfinMaterials(input, retrievedAt), parseStatfinMaterials(fixture(), retrievedAt));
});

test('StatFin identity, coordinate, timestamp and value corruption fail closed', () => {
  const mutations = [
    x => { x.dimension[dim.product].category.index = { '24': 0, '241': 1 }; },
    x => { x.dimension[dim.market].category.index = { '5': 0 }; },
    x => { x.dimension[dim.measure].category.index = { 'thi-pisteluku15': 0 }; },
    x => { x.dimension[dim.measure].category.unit['thi-pisteluku21'].base = 'EUR/kg'; },
    x => { x.dimension[dim.time].category.index['2026M08'] = 1; },
    x => { x.dimension[dim.time].category.index = { '2026M00': 0, '2026M07': 1, '2026M08': 2 }; },
    x => { x.id[1] = dim.time; },
    x => { x.size[0] = 4; },
    x => { x.value[0] = -3; },
    x => { x.value[0] = '140'; },
    x => { x.value[0] = Infinity; },
    x => { x.value[6] = 100; },
    x => { x.value = {}; },
    x => { delete x.updated; },
    x => { x.updated = '2026-09-20T00:00:00Z'; },
  ];
  for (const mutate of mutations) { const input = fixture(); mutate(input); assert.throws(() => parseStatfinMaterials(input, retrievedAt)); }
  assert.throws(() => parseStatfinMaterials(fixture(), 'invalid'));
});

test('StatFin query uses current dimension codes, domestic output prices and explicit months', () => {
  const query = buildStatfinQuery(['2026M07', '2025M01']);
  assert.deepEqual(query.query.map(row => [row.code, row.selection.values]), [
    [dim.product, ['241', '2444']], [dim.time, ['2025M01', '2026M07']], [dim.market, ['2']], [dim.measure, ['thi-pisteluku21']],
  ]);
  assert.equal(query.response.format, 'json-stat2');
  for (const periods of [undefined, [], ['2026M13'], ['2026-01'], ['2026M01', '2026M01']]) assert.throws(() => buildStatfinQuery(periods));
});
