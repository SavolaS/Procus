import test from 'node:test';
import assert from 'node:assert/strict';
import { products, states, suppliers, conversations, agents } from '../src/data.js';
import {
  computeSpend, potentialSaving, alertLevel, alertCounts, isOpen, pipeline,
  categoryTotals, spendSeries, restoreState, persistState, loadState, annualSpend,
  realisedSaving, trend,
} from '../src/model.js';

test('the sample data set is large enough to show a portfolio, not a demo', () => {
  assert.equal(products.length, 49);
  assert.equal(suppliers.length, 8);
  assert.ok(products.every(product => product.history.length === 12));
  assert.ok(products.every(product => product.history.at(-1) === product.price));
  assert.ok(new Set(products.map(product => product.id)).size === products.length);
});

test('baseline spend, opportunity and agreed savings share one set of volume assumptions', () => {
  assert.deepEqual(computeSpend(products), {
    current: 25736290, potential: 1487271, agreed: 185032, realised: 34469,
    projected: 25551258, remaining: 1302239,
  });
});

test('agreed savings are part of the identified opportunity, never added on top', () => {
  const before = computeSpend(products);
  const after = computeSpend(products, { 'NF-101': 'Agreed' });
  assert.equal(after.potential, before.potential);
  assert.equal(after.agreed, before.agreed + potentialSaving(products.find(p => p.id === 'NF-101')));
  assert.equal(after.projected, after.current - after.agreed);
  assert.equal(after.remaining, after.potential - after.agreed);
});

test('dismissing an opportunity removes it from both totals', () => {
  const result = computeSpend(products, { 'BC-112': 'No action' });
  const dismissed = potentialSaving(products.find(p => p.id === 'BC-112'));
  assert.equal(result.potential, computeSpend(products).potential - dismissed);
  assert.equal(result.agreed, computeSpend(products).agreed - dismissed);
});

test('realised savings are a subset of agreed, which is a subset of identified', () => {
  const totals = computeSpend(products);
  assert.ok(totals.realised > 0);
  assert.ok(totals.realised < totals.agreed, 'not every agreement has reached an invoice');
  assert.ok(totals.agreed < totals.potential);
  assert.equal(totals.realised, 34469);
});

test('marking a case agreed in the workspace realises nothing until it is invoiced', () => {
  const fresh = products.find(product => product.signal && product.status !== 'Agreed');
  assert.equal(realisedSaving(fresh, { [fresh.id]: 'Agreed' }), 0);
  assert.equal(computeSpend(products, { [fresh.id]: 'Agreed' }).realised, computeSpend(products).realised);
  const verified = products.find(product => product.verifiedMonths > 0);
  assert.equal(realisedSaving(verified, {}), Math.round(potentialSaving(verified) * verified.verifiedMonths / 12));
  assert.equal(realisedSaving(verified, { [verified.id]: 'Negotiating' }), 0, 'reopening a case withdraws the realised saving');
});

test('missing and higher reference prices never imply a saving', () => {
  assert.equal(potentialSaving({ price: 10, target: null, qty: 100 }), 0);
  assert.equal(potentialSaving({ price: 10, target: 12, qty: 100 }), 0);
  assert.equal(annualSpend({ price: 2.5, qty: 1000 }), 2500);
});

test('a price that barely moved reads as flat rather than as a direction', () => {
  assert.equal(trend({ change: 0.3, history: [1], price: 1 }).direction, 'flat');
  assert.equal(trend({ change: -0.4, history: [1], price: 1 }).direction, 'flat');
  assert.equal(trend({ change: 0.6, history: [1], price: 1 }).direction, 'up');
  assert.equal(trend({ change: -1.2, history: [1], price: 1 }).direction, 'down');
});

test('severity follows what a signal is worth, and parts without a signal never alert', () => {
  assert.equal(alertLevel({ signal: null, price: 10, target: 5, qty: 100000, change: 20 }), null);
  assert.equal(alertLevel({ signal: 'increase', price: 10, target: 9, qty: 100000, change: 2 }), 'critical');
  assert.equal(alertLevel({ signal: 'benchmark', price: 10, target: 9.6, qty: 100000, change: 1 }), 'warning');
  assert.equal(alertLevel({ signal: 'benchmark', price: 10, target: 9.9, qty: 10000, change: 1 }), 'watch');
  assert.deepEqual(alertCounts(products), { critical: 9, warning: 15, watch: 9, total: 33 });
});

test('only open cases alert, so agreeing or dismissing one clears it', () => {
  const open = products.find(product => isOpen(product, {}));
  assert.equal(isOpen(open, { [open.id]: 'Agreed' }), false);
  assert.equal(isOpen(open, { [open.id]: 'No action' }), false);
  assert.equal(alertCounts(products, { [open.id]: 'Agreed' }).total, alertCounts(products).total - 1);
});

test('the pipeline reports every stage with its value and stalled cases', () => {
  const stages = pipeline(products, {}, states);
  assert.deepEqual(stages.map(stage => stage.state), states);
  assert.equal(stages.reduce((sum, stage) => sum + stage.items.length, 0), products.length);
  assert.equal(stages.at(-1).value, 0, 'dismissed cases carry no open value');
  assert.ok(stages.every(stage => stage.stalled.every(product => product.daysInStage > 21)));
  assert.equal(stages.find(stage => stage.state === 'Agreed').value, computeSpend(products).agreed);
});

test('category totals cover every part exactly once', () => {
  const categories = categoryTotals(products);
  assert.equal(categories.reduce((sum, entry) => sum + entry.count, 0), products.length);
  assert.equal(categories.reduce((sum, entry) => sum + entry.current, 0), computeSpend(products).current);
  assert.ok(categories[0].current >= categories.at(-1).current, 'sorted by spend');
});

test('the spend series tracks prices actually paid and projects the three scenarios apart', () => {
  const series = spendSeries(products);
  assert.equal(series.paid.length, 12);
  assert.ok(series.paid.at(-1) > series.paid[0], 'prices rose over the period');
  assert.equal(series.monthly.current, Math.round(computeSpend(products).current / 12));
  assert.ok(series.monthly.captured < series.monthly.agreed);
  assert.ok(series.monthly.agreed < series.monthly.current);
});

test('agent and conversation data is wired to real parts', () => {
  const ids = new Set(products.map(product => product.id));
  assert.ok(conversations.every(entry => ids.has(entry.product)));
  assert.ok(conversations.every(entry => entry.messages.length > 0));
  assert.ok(agents.every(agent => ['running', 'idle', 'waiting', 'blocked'].includes(agent.state)));
});

test('restoring browser data only accepts values that still exist', () => {
  const restored = restoreState({
    version: 3, view: 'agents', selected: 'missing', statusFilter: 'invalid', alertFilter: 'critical',
    statuses: { 'NF-101': 'Agreed', 'BC-112': 'invalid', missing: 'Agreed' },
    collapsed: ['Nordform Oy'], query: 'a'.repeat(200), handled: ['CV-01', 7], paused: ['price-watch'],
  }, products, states);
  assert.equal(restored.view, 'agents');
  assert.equal(restored.selected, undefined);
  assert.equal(restored.statusFilter, undefined);
  assert.equal(restored.alertFilter, 'critical');
  assert.deepEqual(restored.statuses, { 'NF-101': 'Agreed' });
  assert.equal(restored.collapsed, undefined, 'collapsed groups are never restored');
  assert.deepEqual(restored.handled, ['CV-01']);
  assert.deepEqual(restored.paused, ['price-watch']);
  assert.equal(restored.query.length, 100);
});

test('state from an earlier version is ignored rather than half-restored', () => {
  assert.deepEqual(restoreState({ version: 2, view: 'workflow', statuses: { 'NF-101': 'Agreed' } }, products, states), {});
  assert.deepEqual(restoreState(null, products, states), {});
  assert.equal(restoreState({ version: 3, view: 'nope' }, products, states).view, undefined);
});

test('supplier groups start expanded on every visit, whatever was stored', () => {
  assert.equal(persistState({ collapsed: ['Nordform Oy'], view: 'products' }, mockStorage()), true);
  const saved = JSON.parse(mockStorage.last);
  assert.equal(saved.collapsed, undefined, 'collapse state is never written');
});

function mockStorage() {
  return { getItem: () => null, setItem: (_key, value) => { mockStorage.last = value; } };
}

test('persistence survives a reload and fails quietly when storage is unavailable', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  assert.equal(persistState({ view: 'spend', statuses: { 'NF-101': 'Agreed' }, handled: ['CV-01'] }, storage), true);
  const saved = loadState(storage);
  assert.equal(saved.version, 3);
  assert.equal(saved.view, 'spend');
  assert.deepEqual(restoreState(saved, products, states).statuses, { 'NF-101': 'Agreed' });
  const blocked = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
  assert.equal(loadState(blocked), null);
  assert.equal(persistState({}, blocked), false);
});
