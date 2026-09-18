export const STORAGE_KEY = 'procus.workspace.v1';

export function getStatus(product, statuses = {}) {
  return statuses[product.id] ?? product.status;
}

export function potentialSaving(product) {
  if (product.target == null) return 0;
  return Math.max(0, Math.round((product.price - product.target) * product.qty));
}

// Agreed savings are a subset of opportunity, never an additional saving.
// This is a fixed-volume scenario, not a forecast of actual purchases.
export function computeSpend(products, statuses = {}) {
  const totals = products.reduce((sum, product) => {
    const status = getStatus(product, statuses);
    const saving = potentialSaving(product);
    sum.current += Math.round(product.price * product.qty);
    if (status !== 'No action') sum.potential += saving;
    if (status === 'Agreed') sum.agreed += saving;
    return sum;
  }, { current: 0, potential: 0, agreed: 0 });
  return { ...totals, projected: totals.current - totals.agreed };
}

export function restoreState(saved, products, states) {
  if (!saved || saved.version !== 1) return {};
  const restored = { statuses: {}, draft: false };
  const legacyStatuses = { Uusi: 'New', 'Selvityksessä': 'Under review', Neuvottelussa: 'Negotiating', Sovittu: 'Agreed', 'Ei toimenpidettä': 'No action' };
  const normalizeStatus = value => legacyStatuses[value] ?? value;
  if (['products', 'workflow', 'spend'].includes(saved.view)) restored.view = saved.view;
  if (products.some(product => product.id === saved.selected)) restored.selected = saved.selected;
  if (typeof saved.query === 'string') restored.query = saved.query.slice(0, 100);
  restored.onlyFlags = saved.onlyFlags === true;
  if (saved.statusFilter === 'all' || states.includes(normalizeStatus(saved.statusFilter))) {
    restored.statusFilter = normalizeStatus(saved.statusFilter);
  }
  const suppliers = new Set(products.map(product => product.supplier));
  restored.collapsed = Array.isArray(saved.collapsed)
    ? saved.collapsed.filter(supplier => suppliers.has(supplier)) : [];
  if (saved.statuses && typeof saved.statuses === 'object') {
    for (const product of products) {
      if (states.includes(normalizeStatus(saved.statuses[product.id]))) {
        restored.statuses[product.id] = normalizeStatus(saved.statuses[product.id]);
      }
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
    (storage ?? globalThis.localStorage).setItem(STORAGE_KEY, JSON.stringify({ ...state, version: 1 }));
    return true;
  } catch {
    return false;
  }
}
