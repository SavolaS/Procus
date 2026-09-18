import test from 'node:test';
import assert from 'node:assert/strict';
import { products, states } from '../src/data.js';
import { computeSpend, potentialSaving, restoreState, persistState, loadState } from '../src/model.js';

test('baseline spend and agreed savings use the same volume assumptions', () => {
  assert.deepEqual(computeSpend(products), {
    current: 855700, potential: 41520, agreed: 5120, projected: 850580,
  });
});

test('agreeing a proposal changes projected spend without double counting potential', () => {
  const result = computeSpend(products, { 'NF-101': 'Agreed' });
  assert.equal(result.potential, 41520);
  assert.equal(result.agreed, 21320);
  assert.equal(result.projected, 834380);
});

test('dismissed opportunities and reopened agreements update both totals', () => {
  const result = computeSpend(products, { 'NF-101': 'No action', 'BC-112': 'Negotiating' });
  assert.equal(result.potential, 25320);
  assert.equal(result.agreed, 0);
  assert.equal(result.projected, result.current);
});

test('missing and higher target prices never imply savings', () => {
  assert.equal(potentialSaving({ price: 10, target: null, qty: 100 }), 0);
  assert.equal(potentialSaving({ price: 10, target: 12, qty: 100 }), 0);
});

test('restoring browser data only accepts valid product statuses and suppliers', () => {
  const restored = restoreState({
    version: 1, selected: 'missing', statuses: { 'NF-101': 'Agreed', 'BC-112': 'invalid', missing: 'Agreed' },
    collapsed: ['Nordform', 'Unknown'], statusFilter: 'invalid', query: 'a'.repeat(200), onlyFlags: true,
  }, products, states);
  assert.deepEqual(restored.statuses, { 'NF-101': 'Agreed' });
  assert.deepEqual(restored.collapsed, ['Nordform']);
  assert.equal(restored.selected, undefined);
  assert.equal(restored.statusFilter, undefined);
  assert.equal(restored.query.length, 100);
  assert.equal(restored.onlyFlags, true);
});

test('persistence survives reload and fails gracefully when unavailable', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  assert.equal(persistState({ statuses: { 'NF-101': 'Agreed' } }, storage), true);
  assert.deepEqual(loadState(storage), { version: 1, statuses: { 'NF-101': 'Agreed' } });
  const blocked = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
  assert.equal(loadState(blocked), null);
  assert.equal(persistState({}, blocked), false);
});

test('saved views are validated and earlier Finnish statuses migrate to English', () => {
  const restored = restoreState({
    version: 1, view: 'workflow', statusFilter: 'Selvityksessä', statuses: { 'NF-101': 'Sovittu' },
  }, products, states);
  assert.equal(restored.view, 'workflow');
  assert.equal(restored.statusFilter, 'Under review');
  assert.deepEqual(restored.statuses, { 'NF-101': 'Agreed' });
  assert.equal(restoreState({ version: 1, view: 'invalid' }, products, states).view, undefined);
});
