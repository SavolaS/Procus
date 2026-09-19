const STORAGE_KEY = 'procus.workspace.v3';
const views = ['overview', 'products', 'workflow', 'agents', 'spend'];
const alertLevels = ['critical', 'warning', 'watch'];
export const openStates = ['New', 'Under review', 'Negotiating'];

export function getStatus(product, statuses = {}) {
  return statuses[product.id] ?? product.status;
}

export function potentialSaving(product) {
  if (product.target == null) return 0;
  return Math.max(0, Math.round((product.price - product.target) * product.qty));
}

export function annualSpend(product) {
  return Math.round(product.price * product.qty);
}

// Severity ranks a signal by what it is worth and how sharply the price moved,
// so the biggest exposures surface first rather than the loudest percentages.
export function alertLevel(product) {
  if (!product.signal) return null;
  const saving = potentialSaving(product);
  if (saving >= 80000 || product.change >= 9) return 'critical';
  if (saving >= 30000 || product.change >= 5) return 'warning';
  return 'watch';
}

export function isOpen(product, statuses = {}) {
  return Boolean(product.signal) && openStates.includes(getStatus(product, statuses));
}

export function trend(product) {
  const [first] = product.history;
  const direction = Math.abs(product.change) < 0.5 ? 'flat' : product.change > 0 ? 'up' : 'down';
  return { direction, change: product.change, from: first, to: product.price };
}

// Agreed savings are a subset of the identified opportunity, never an addition.
// Fixed volumes: this is a planning scenario, not a forecast of actual purchases.
export function computeSpend(products, statuses = {}) {
  const totals = products.reduce((sum, product) => {
    const status = getStatus(product, statuses);
    const saving = potentialSaving(product);
    sum.current += annualSpend(product);
    if (status !== 'No action') sum.potential += saving;
    if (status === 'Agreed') sum.agreed += saving;
    sum.realised += realisedSaving(product, statuses);
    return sum;
  }, { current: 0, potential: 0, agreed: 0, realised: 0 });
  return { ...totals, projected: totals.current - totals.agreed, remaining: totals.potential - totals.agreed };
}

// Realised savings come from invoices, not from a status change: marking a case
// Agreed in the workspace adds nothing here until purchases are recorded at the
// new price. Realised is always a subset of agreed, which is a subset of potential.
export function realisedSaving(product, statuses = {}) {
  if (getStatus(product, statuses) !== 'Agreed' || !product.verifiedMonths) return 0;
  return Math.round(potentialSaving(product) * (product.verifiedMonths / 12));
}

export function alertCounts(products, statuses = {}) {
  const counts = { critical: 0, warning: 0, watch: 0, total: 0 };
  for (const product of products) {
    if (!isOpen(product, statuses)) continue;
    counts[alertLevel(product)] += 1;
    counts.total += 1;
  }
  return counts;
}


export function pipeline(products, statuses = {}, states = []) {
  return states.map(state => {
    const items = products.filter(product => getStatus(product, statuses) === state);
    const value = state === 'No action' ? 0 : items.reduce((sum, product) => sum + potentialSaving(product), 0);
    const active = items.filter(product => product.signal && state !== 'No action');
    const stalled = active.filter(product => product.daysInStage > 21);
    const oldest = active.reduce((max, product) => Math.max(max, product.daysInStage), 0);
    return { state, items, value, stalled, oldest, owners: [...new Set(active.map(product => product.owner))] };
  });
}

export function categoryTotals(products, statuses = {}) {
  const groups = new Map();
  for (const product of products) {
    const entry = groups.get(product.category) ?? { category: product.category, current: 0, potential: 0, count: 0 };
    entry.current += annualSpend(product);
    if (getStatus(product, statuses) !== 'No action') entry.potential += potentialSaving(product);
    entry.count += 1;
    groups.set(product.category, entry);
  }
  return [...groups.values()].sort((a, b) => b.current - a.current);
}

// Twelve months of spend at the prices actually paid, then three months projected
// at today's prices, after agreed changes, and with every open opportunity captured.
export function spendSeries(products, statuses = {}, monthCount = 12, forecast = 3) {
  const totals = computeSpend(products, statuses);
  const paid = [];
  for (let index = 0; index < monthCount; index += 1) {
    paid.push(Math.round(products.reduce((sum, product) => sum + product.history[index] * product.qty, 0) / 12));
  }
  const current = Math.round(totals.current / 12);
  const agreed = Math.round(totals.projected / 12);
  const captured = Math.round((totals.current - totals.potential) / 12);
  return {
    paid,
    forecast: {
      current: Array(forecast).fill(current),
      agreed: Array(forecast).fill(agreed),
      captured: Array(forecast).fill(captured),
    },
    monthly: { current, agreed, captured },
  };
}

// Supplier groups are deliberately not persisted: a returning user should always
// land on a fully expanded table rather than yesterday's collapsed one.
export function restoreState(saved, products, states) {
  if (!saved || saved.version !== 3) return {};
  const restored = { statuses: {}, handled: [] };
  if (views.includes(saved.view)) restored.view = saved.view;
  if (products.some(product => product.id === saved.selected)) restored.selected = saved.selected;
  if (typeof saved.query === 'string') restored.query = saved.query.slice(0, 100);
  if (saved.statusFilter === 'all' || states.includes(saved.statusFilter)) restored.statusFilter = saved.statusFilter;
  if (saved.alertFilter === 'all' || alertLevels.includes(saved.alertFilter)) restored.alertFilter = saved.alertFilter;
  if (Array.isArray(saved.handled)) restored.handled = saved.handled.filter(id => typeof id === 'string').slice(0, 50);
  if (Array.isArray(saved.paused)) restored.paused = saved.paused.filter(id => typeof id === 'string').slice(0, 20);
  if (saved.statuses && typeof saved.statuses === 'object') {
    for (const product of products) {
      if (states.includes(saved.statuses[product.id])) restored.statuses[product.id] = saved.statuses[product.id];
    }
  }
  return restored;
}

export function loadState(storage) {
  try {
    return JSON.parse((storage ?? globalThis.localStorage).getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export function persistState(state, storage) {
  try {
    const { view, selected, query, statusFilter, alertFilter, statuses, handled, paused } = state;
    (storage ?? globalThis.localStorage).setItem(STORAGE_KEY, JSON.stringify({
      version: 3, view, selected, query, statusFilter, alertFilter, statuses, handled, paused,
    }));
    return true;
  } catch {
    return false;
  }
}
