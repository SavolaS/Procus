import { rfqDraft } from './rfq.js';
import { negotiationDialog, supplierDraft } from './negotiation.js';
import { products, states, suppliers, conversations, agents, period } from './data.js';
import {
  getStatus, alertCounts, isOpen, computeSpend,
  restoreState, persistState, loadState, openStates,
} from './model.js';
import { renderers, detailPanel, productRows, viewMeta, eur, topOpportunity } from './views.js';

let returnFocus = null;
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
    overview: [`${period.start} – ${period.end}`, 'EUR'],
    products: [`${products.length} parts`, `${suppliers.length} suppliers`, `${counts.total} open alerts`],
    workflow: [`${openCases().length} open cases`, `${eur(totals.remaining)} still open`],
    agents: [`${agents.length} agents`, `${blockedQueue().length} decisions pending`],
    spend: [`${period.start} – ${period.end}`, 'EUR'],
  }[ui.view];
  const actions = '';
  return `<div class="p-pagehead__main">
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
  $('#p-overlay').innerHTML = negotiationDialog(ui);
  const overlayOpen = Boolean(ui.negotiation || ui.detailOpen);
  document.body.classList.toggle('has-overlay', overlayOpen);
  $('.p-globalheader').inert = overlayOpen;
  $('.p-sidebar').inert = overlayOpen;
  $('#p-pagehead').inert = overlayOpen;
  $('#p-view').inert = Boolean(ui.negotiation);
  if (ui.detailOpen && !ui.negotiation) {
    for (const node of $('#p-view').children) {
      if (node.classList.contains('p-work')) {
        for (const child of node.children) child.inert = !child.matches('.p-detail, .p-drawer-shade');
      } else node.inert = true;
    }
  }
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
  $('#p-detail')?.focus({ preventScroll: true });
}

function openProduct(id, view = ui.view) {
  returnFocus = `[data-product="${id}"]`;
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

function closeOverlay() {
  ui.negotiation = null;
  ui.detailOpen = false;
  ui.brief = false;
  render();
  (returnFocus && root.querySelector(returnFocus) || root.querySelector('[aria-current="page"]'))?.focus({ preventScroll: true });
}

root.addEventListener('keydown', event => {
  const dialog = root.querySelector('[role="dialog"]');
  if (!dialog) return;
  if (event.key === 'Escape') { event.preventDefault(); closeOverlay(); return; }
  if (event.key !== 'Tab') return;
  const focusable = [...dialog.querySelectorAll('button, input, select, textarea, [tabindex="0"]')].filter(el => !el.disabled && el.getClientRects().length);
  const first = focusable[0], last = focusable.at(-1);
  if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { event.preventDefault(); last?.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
});

root.addEventListener('click', async event => {
  const generate = event.target.closest('[data-generate]');
  if (generate) {
    const product = products.find(p => p.id === generate.dataset.generate);
    if (!product || product.target == null) return;
    if (!ui.detailOpen) returnFocus = `[data-generate="${product.id}"]`;
    ui.detailOpen = false;
    ui.negotiation = { id: product.id, step: 'plan', draft: supplierDraft(product), subject: `Price review · ${product.id} ${product.name}` };
    render();
    $('.p-negotiation')?.focus();
    return;
  }
  if (event.target.closest('[data-close-negotiation], [data-close-detail]')) { closeOverlay(); return; }
  if (event.target.closest('[data-find-alternatives], [data-run-rfq], [data-rfq-draft]')) {
    const flow = ui.negotiation;
    if (!flow) return;
    flow.step = 'rfq';
    if (event.target.closest('[data-run-rfq]')) flow.rfqComplete = true;
    if (event.target.closest('[data-rfq-draft]')) {
      const product = products.find(p => p.id === flow.id);
      flow.step = 'rfq-draft';
      flow.rfqDraft ??= rfqDraft(product);
      flow.rfqSubject ??= `Request for quotation · ${product.id} ${product.name}`;
    }
    $('#p-overlay').innerHTML = negotiationDialog(ui);
    $('.p-negotiation')?.focus();
    return;
  }
  if (event.target.closest('[data-draft-message], [data-plan-back]')) {
    ui.negotiation.step = event.target.closest('[data-draft-message]') ? 'draft' : 'plan';
    $('#p-overlay').innerHTML = negotiationDialog(ui);
    $('.p-negotiation')?.focus();
    return;
  }
  if (event.target.closest('[data-copy-draft]')) {
    try {
      const flow = ui.negotiation;
      const sourcing = flow.step === 'rfq-draft';
      await navigator.clipboard.writeText(`Subject: ${sourcing ? flow.rfqSubject : flow.subject}\n\n${sourcing ? flow.rfqDraft : flow.draft}`);
      $('#p-draft-feedback').textContent = 'Draft copied. Nothing has been sent.';
    } catch {
      $('#p-message-body').focus();
      $('#p-message-body').select();
      $('#p-draft-feedback').textContent = 'Select and copy the message with your keyboard.';
    }
    return;
  }

  const goto = event.target.closest('[data-goto]');
  if (goto) {
    const { goto: view, product, alert: level, thread } = goto.dataset;
    if (view === 'products') {
      ui.query = '';
      ui.alertFilter = level || 'all';
      ui.statusFilter = goto.dataset.status || 'all';
    }
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

  if (event.target.closest('#p-close-detail')) { closeOverlay(); return; }

  if (event.target.closest('#p-brief')) {
    // Replace only the panel so the rest of the page, and its scroll position, stay put.
    ui.brief = !ui.brief;
    render();
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
  if (ui.negotiation && ['p-message-body', 'p-message-subject'].includes(event.target.id)) {
    const sourcing = ui.negotiation.step === 'rfq-draft';
    const key = event.target.id === 'p-message-subject' ? sourcing ? 'rfqSubject' : 'subject' : sourcing ? 'rfqDraft' : 'draft';
    ui.negotiation[key] = event.target.value;
    return;
  }
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
