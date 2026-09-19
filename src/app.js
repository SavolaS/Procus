import { products, states, suppliers, conversations } from './data.js';
import {
  getStatus, alertCounts, isOpen, computeSpend,
  restoreState, persistState, loadState, openStates,
} from './model.js';
import { renderers, detailPanel, productRows, viewMeta, eur, topOpportunity } from './views.js';

const root = document.getElementById('procus-workspace');
const $ = selector => root.querySelector(selector);

const ui = {
  view: 'overview', selected: products[0].id, query: '', statusFilter: 'all', alertFilter: 'all',
  statuses: {}, handled: [], paused: [], detailOpen: false, brief: false, thread: null, collapsed: [],
  ...restoreState(loadState(), products, states),
};

const save = () => persistState(ui);
const openCases = () => products.filter(product => isOpen(product, ui.statuses));
const blockedQueue = () => conversations.filter(entry => entry.needs && !ui.handled.includes(entry.id));

function pageHeader() {
  const [title, subtitle] = viewMeta[ui.view];
  const totals = computeSpend(products, ui.statuses);
  const counts = alertCounts(products, ui.statuses);
  const meta = {
    overview: [`${suppliers.length} suppliers`, `${products.length} parts`, `${eur(totals.current)} annual spend`],
    products: [`${products.length} parts`, `${suppliers.length} suppliers`, `${counts.total} open alerts`],
    workflow: [`${openCases().length} open cases`, `${eur(totals.remaining)} still open`],
    agents: ['6 agents', `${blockedQueue().length} waiting on you`],
    spend: [`${eur(totals.current)} baseline`, `${eur(totals.potential)} identified`],
  }[ui.view];
  const actions = ui.view === 'products' && ui.detailOpen
    ? '<button type="button" class="p-button" id="p-close-detail">Close detail</button>' : '';
  return `<div class="p-pagehead__main">
      <p class="p-pagehead__crumb">Procurement workspace</p>
      <h1>${title}</h1>
      <p class="p-pagehead__sub">${subtitle}</p>
    </div>
    <div class="p-pagehead__side">
      <ul class="p-pagehead__meta">${meta.map(item => `<li>${item}</li>`).join('')}</ul>${actions}
    </div>`;
}

function syncNav() {
  const counts = alertCounts(products, ui.statuses);
  const queue = blockedQueue().length;
  const map = { products: counts.total, workflow: openCases().length, agents: queue };
  for (const node of root.querySelectorAll('[data-count]')) {
    const value = map[node.dataset.count];
    node.textContent = value || '';
    node.dataset.tone = node.dataset.count === 'agents' && queue ? 'alert' : counts.critical && node.dataset.count === 'products' ? 'alert' : '';
  }
  for (const button of root.querySelectorAll('[data-view]')) {
    if (button.dataset.view === ui.view) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  }
}

function render() {
  $('#p-pagehead').innerHTML = pageHeader();
  $('#p-view').innerHTML = renderers[ui.view](ui);
  if (ui.view === 'products') refreshRows();
  syncNav();
  document.title = `Procus — ${viewMeta[ui.view][0]}`;
}

function refreshRows() {
  const { html, count } = productRows(ui);
  $('#p-rows').innerHTML = html;
  $('#p-resultcount').textContent = `${count} of ${products.length} parts`;
}

function revealDetail() {
  if (window.matchMedia('(max-width: 1240px)').matches) $('#p-detail')?.scrollIntoView({ block: 'start' });
}

function openProduct(id, view = ui.view) {
  ui.view = ['products', 'workflow'].includes(view) ? view : 'products';
  ui.selected = id;
  ui.detailOpen = true;
  ui.brief = false;
  if (ui.view === 'products') {
    const product = products.find(entry => entry.id === id);
    if (product) {
      ui.collapsed = ui.collapsed.filter(name => name !== product.supplier);
      if (ui.statusFilter !== 'all' && getStatus(product, ui.statuses) !== ui.statusFilter) ui.statusFilter = 'all';
    }
  }
  render();
  root.querySelector(`[data-product="${id}"]`)?.focus({ preventScroll: true });
  revealDetail();
  save();
}

root.addEventListener('click', event => {
  const goto = event.target.closest('[data-goto]');
  if (goto) {
    const { goto: view, product, alert: level, thread } = goto.dataset;
    if (level) ui.alertFilter = level;
    if (thread) ui.thread = thread;
    if (product) {
      openProduct(product, view);
      return;
    }
    ui.view = view;
    ui.detailOpen = false;
    render();
    save();
    return;
  }

  const productButton = event.target.closest('[data-product]');
  if (productButton) {
    openProduct(productButton.dataset.product);
    return;
  }

  if (event.target.closest('#p-review-next')) {
    const next = topOpportunity(ui);
    if (next) {
      ui.query = '';
      ui.alertFilter = 'all';
      ui.statusFilter = 'all';
      openProduct(next.id, 'products');
      $('#p-detailstatus')?.focus({ preventScroll: true });
    }
    return;
  }

  const view = event.target.closest('[data-view]');
  if (view) {
    ui.view = view.dataset.view;
    ui.detailOpen = false;
    ui.brief = false;
    render();
    save();
    return;
  }

  const supplier = event.target.closest('[data-supplier]');
  if (supplier) {
    const name = supplier.dataset.supplier;
    ui.collapsed = ui.collapsed.includes(name) ? ui.collapsed.filter(entry => entry !== name) : [...ui.collapsed, name];
    refreshRows();
    root.querySelector(`[data-supplier="${CSS.escape(name)}"]`)?.focus({ preventScroll: true });
    save();
    return;
  }

  const chip = event.target.closest('.p-alertbar__chip');
  if (chip) {
    ui.alertFilter = chip.dataset.alert;
    render();
    root.querySelector(`.p-alertbar__chip[data-alert="${ui.alertFilter}"]`)?.focus({ preventScroll: true });
    save();
    return;
  }

  if (event.target.closest('[data-reset]')) {
    ui.query = '';
    ui.alertFilter = 'all';
    ui.statusFilter = 'all';
    render();
    save();
    return;
  }

  if (event.target.closest('#p-close-detail')) {
    ui.detailOpen = false;
    ui.brief = false;
    render();
    root.querySelector(`[data-product="${ui.selected}"]`)?.focus({ preventScroll: true });
    return;
  }

  if (event.target.closest('#p-brief')) {
    ui.brief = !ui.brief;
    $('#p-detail').innerHTML = detailPanel(ui).replace(/^<aside[^>]*>|<\/aside>$/g, '');
    $('#p-brief')?.focus({ preventScroll: true });
    return;
  }

  const agent = event.target.closest('[data-agent]');
  if (agent) {
    const id = agent.dataset.agent;
    ui.paused = ui.paused.includes(id) ? ui.paused.filter(entry => entry !== id) : [...ui.paused, id];
    render();
    root.querySelector(`[data-agent="${id}"]`)?.focus({ preventScroll: true });
    save();
    return;
  }

  const thread = event.target.closest('[data-thread]');
  if (thread) {
    ui.thread = ui.thread === thread.dataset.thread ? null : thread.dataset.thread;
    render();
    root.querySelector(`[data-thread="${thread.dataset.thread}"]`)?.focus({ preventScroll: true });
    return;
  }

  const resolve = event.target.closest('[data-resolve]');
  if (resolve) {
    const entry = conversations.find(item => item.id === resolve.dataset.resolve);
    if (resolve.dataset.choice !== 'dismiss' && entry?.product && resolve.dataset.choice === 'approve') {
      const product = products.find(item => item.id === entry.product);
      if (product && openStates.includes(getStatus(product, ui.statuses))) ui.statuses[product.id] = 'Negotiating';
    }
    ui.handled = [...new Set([...ui.handled, resolve.dataset.resolve])];
    render();
    save();
  }
});

root.addEventListener('input', event => {
  if (event.target.id !== 'p-search') return;
  ui.query = event.target.value;
  refreshRows();
  save();
});

root.addEventListener('change', event => {
  if (event.target.id === 'p-statusfilter') {
    ui.statusFilter = event.target.value;
    refreshRows();
    save();
  } else if (event.target.id === 'p-detailstatus') {
    ui.statuses[ui.selected] = event.target.value;
    render();
    $('#p-detailstatus')?.focus({ preventScroll: true });
    const saved = save();
    const note = $('#p-saved');
    if (note) note.textContent = saved ? 'Saved in this browser.' : 'Updated for this session — browser storage is unavailable.';
  }
});

render();
