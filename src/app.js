import { products, states } from './data.js';
import { computeSpend, potentialSaving, getStatus, restoreState, persistState, loadState } from './model.js';

const root = document.getElementById('procus-workspace');
const $ = selector => root.querySelector(selector);
const suppliers = [...new Set(products.map(product => product.supplier))];
const views = {
  products: ['Products & suppliers', 'Monitor prices and review purchasing opportunities.'],
  workflow: ['Workflow', 'Track each opportunity from review to agreement.'],
  spend: ['Spend impact', 'Annual purchasing at your current and agreed prices.'],
};
const ui = {
  selected: products[0].id, view: 'products', query: '', onlyFlags: false,
  statusFilter: 'all', collapsed: [], statuses: {}, draft: false, detailOpen: false,
  ...restoreState(loadState(), products, states),
};
const eur = value => new Intl.NumberFormat('en-IE', {
  style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
}).format(value);
const unit = value => new Intl.NumberFormat('en-IE', {
  style: 'currency', currency: 'EUR', minimumFractionDigits: 2,
}).format(value);
const reduction = value => value ? `−${eur(value)}` : eur(0);
const integer = value => new Intl.NumberFormat('en-IE').format(value);
const escape = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);
const status = product => getStatus(product, ui.statuses);
const saving = potentialSaving;
const save = () => persistState(ui);
const selectedProduct = () => products.find(product => product.id === ui.selected);
const openProducts = () => products.filter(product => product.flag && !['Agreed', 'No action'].includes(status(product)));
const nextStep = product => status(product) === 'Agreed'
  ? 'Verify the agreed price on the next purchase order, then track actual purchases.' : product.next;

function revealDetail() {
  if (window.matchMedia('(max-width: 1200px)').matches) {
    $('#p-detailstatus')?.focus({ preventScroll: true });
    $('#p-detail')?.scrollIntoView({ block: 'start' });
  }
}

function visibleProducts() {
  const query = ui.query.toLowerCase();
  return products.filter(product =>
    (!query || `${product.name} ${product.id} ${product.supplier}`.toLowerCase().includes(query)) &&
    (!ui.onlyFlags || product.flag) &&
    (ui.statusFilter === 'all' || status(product) === ui.statusFilter));
}

function statusLabel(value) {
  return `<span class="p-status" data-state="${escape(value)}">${escape(value)}</span>`;
}

function renderRows() {
  const visible = visibleProducts();
  $('#p-resultcount').textContent = `${visible.length} of ${products.length} products`;
  let html = '';
  for (const supplier of suppliers) {
    const rows = visible.filter(product => product.supplier === supplier);
    if (!rows.length) continue;
    const collapsed = ui.collapsed.includes(supplier) && !ui.query && !ui.onlyFlags && ui.statusFilter === 'all';
    const totals = computeSpend(rows, ui.statuses);
    const flags = rows.filter(product => product.flag).length;
    html += `<tr class="p-supplier">
      <td><button type="button" data-supplier="${escape(supplier)}" aria-expanded="${!collapsed}">
        <span class="p-chevron" aria-hidden="true">${collapsed ? '›' : '⌄'}</span>${escape(supplier)}<span class="p-suppliercount">${rows.length}</span></button></td>
      <td class="p-num">${eur(totals.current)}</td>
      <td><span class="p-muted">${flags ? `${flags} flags` : 'No flags'}</span></td>
      <td></td><td class="p-num">${totals.potential ? eur(totals.potential) : '—'}</td></tr>`;
    if (collapsed) continue;
    for (const product of rows) {
      const potential = status(product) === 'No action' ? 0 : saving(product);
      html += `<tr class="p-item ${ui.detailOpen && ui.selected === product.id ? 'p-selected' : ''}">
        <td><button type="button" class="p-itembutton" data-product="${product.id}" aria-pressed="${ui.detailOpen && ui.selected === product.id}">
          ${escape(product.name)}<span class="p-code">${product.id}</span></button></td>
        <td class="p-num">${eur(product.price * product.qty)}</td>
        <td>${product.flag ? `<span class="p-flag">${escape(product.flag)}</span>` : '<span class="p-muted">—</span>'}</td>
        <td>${statusLabel(status(product))}</td>
        <td class="p-num ${potential ? 'p-positive' : ''}">${potential ? eur(potential) : '—'}</td></tr>`;
    }
  }
  $('#p-rows').innerHTML = html || '<tr><td colspan="5" class="p-empty">No products match these filters.</td></tr>';
}

function detailMarkup() {
  const product = selectedProduct();
  const currentStatus = status(product);
  return `<div class="p-detailbar"><span>Product details</span><button type="button" class="p-close" id="p-close-detail" aria-label="Close product details">×</button></div><header>
      <h2>${escape(product.name)}</h2>
      <div class="p-detail-sub">${escape(product.supplier)} · ${product.id}</div>
      <label for="p-detailstatus">Case status</label>
      <select id="p-detailstatus">${states.map(value => `<option${value === currentStatus ? ' selected' : ''}>${value}</option>`).join('')}</select>
      <div class="p-saved" id="p-saved" role="status"></div>
    </header>
    <section class="p-section"><h3>${product.flag ? 'Price signal' : 'Monitoring'}</h3>
      <p>${escape(product.why)}</p><p class="p-disclosure">${escape(product.source.replace(' · sample evidence', ''))}</p></section>
    <section class="p-section"><h3>12-month spend impact</h3>
      <div class="p-pair"><span>Assumed volume</span><strong>${integer(product.qty)} units</strong></div>
      <div class="p-pair"><span>Current unit price</span><strong>${unit(product.price)}</strong></div>
      ${product.target !== null ? `
        <div class="p-pair"><span>${currentStatus === 'Agreed' ? 'Agreed price' : 'Reference / scenario'}</span><strong>${unit(product.target)}</strong></div>
        <div class="p-impact"><strong>−${eur(saving(product))}</strong><span>${currentStatus === 'Agreed' ? 'Agreed annual impact' : 'Potential annual impact'}</span></div>
        <p class="p-disclosure">${currentStatus === 'No action' ? 'Excluded from total opportunity. ' : ''}Assumes the full example volume at the new price. Additional costs are excluded.</p>`
        : '<p class="p-disclosure">No identified savings opportunity.</p>'}
    </section>
    <section class="p-section"><h3>Next step</h3><p>${escape(nextStep(product))}</p>
      ${product.flag ? `<button class="p-primary" id="p-draftbutton" type="button" aria-expanded="${ui.draft}">${ui.draft ? 'Hide negotiation brief' : 'View negotiation brief'}</button>` : ''}</section>
    ${ui.draft && product.flag ? `<div class="p-draft"><strong>Internal preparation brief</strong>

${escape(product.supplier)} / ${escape(product.name)}

Evidence: ${escape(product.why)}

Next step: ${escape(nextStep(product))}

Discussion outline:
1. Review the basis for the current price.
2. Discuss the comparison and any differences in terms.
3. Agree on next steps and timing.</div>` : ''}`;
}

function renderProducts() {
  const open = openProducts();
  const opportunity = open.reduce((sum, product) => sum + saving(product), 0);
  $('#p-view').innerHTML = `
    <section class="p-focus" aria-label="Open opportunities"><div><span class="p-focuslabel">Needs attention</span><h2>${open.length ? `${open.length} opportunities to review` : 'You’re all caught up'}</h2><p>${open.length ? `${eur(opportunity)} potential annual savings · subject to review` : 'No open price signals in your current products.'}</p></div>${open.length ? '<button type="button" id="p-review-next" class="p-focusaction">Review next <span aria-hidden="true">→</span></button>' : ''}</section>
    <div class="p-toolbar">
      <label class="p-search"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5"/><path d="m13 13 4 4"/></svg><input id="p-search" type="search" placeholder="Search products or manufacturers" aria-label="Search products or manufacturers"></label>
      <div class="p-filter"><label class="p-check"><input id="p-onlyflags" type="checkbox">Flagged only</label>
        <select id="p-statusfilter" aria-label="Filter by case status"><option value="all">All statuses</option>${states.map(value => `<option>${value}</option>`).join('')}</select></div>
    </div>
    <div class="p-work ${ui.detailOpen ? 'has-detail' : ''}">
      <section class="p-list p-productlist" aria-label="Manufacturers and products">
        <div class="p-listtitle"><strong>Manufacturers & products</strong><span class="p-count" id="p-resultcount"></span></div>
        <div class="p-scroll"><table><thead><tr><th scope="col">Product / manufacturer</th><th scope="col" class="p-num">Annual spend</th><th scope="col">Flag</th><th scope="col">Status</th><th scope="col" class="p-num">Opportunity</th></tr></thead><tbody id="p-rows"></tbody></table></div>
        <div class="p-listfoot"><span>All amounts in EUR · annual volumes</span><span>Manufacturer totals reflect filters</span></div>
      </section>
      ${ui.detailOpen ? `<aside class="p-detail" id="p-detail" aria-label="Selected product details">${detailMarkup()}</aside>` : ''}
    </div>`;
  $('#p-search').value = ui.query;
  $('#p-onlyflags').checked = ui.onlyFlags;
  $('#p-statusfilter').value = ui.statusFilter;
  renderRows();
}

function renderWorkflow() {
  $('#p-view').innerHTML = `<div class="p-work ${ui.detailOpen ? 'has-detail' : ''}"><div class="p-workflowarea"><div class="p-board">${states.map(value => {
    const items = products.filter(product => status(product) === value);
    const potential = value === 'No action' ? 0 : items.reduce((sum, product) => sum + saving(product), 0);
    return `<section class="p-lane" aria-label="${value} cases">
      <div class="p-laneheading">${statusLabel(value)}<span class="p-count">${items.length}</span></div>
      <p class="p-lanetotal">${potential ? `${eur(potential)} annual impact` : 'No active opportunity'}</p>
      ${items.map(product => `<button type="button" class="p-case ${ui.detailOpen && ui.selected === product.id ? 'p-selected' : ''}" data-product="${product.id}" aria-pressed="${ui.detailOpen && ui.selected === product.id}">
        <span class="p-code">${escape(product.supplier)}</span><strong>${escape(product.name)}</strong>
        ${product.flag ? `<span class="p-flag">${escape(product.flag)}</span>` : '<span class="p-casequiet">Monitoring</span>'}
        <span class="p-caseamount">${value !== 'No action' && saving(product) ? eur(saving(product)) : '—'}</span>
      </button>`).join('') || '<p class="p-laneempty">No cases at this stage.</p>'}
    </section>`;
  }).join('')}</div>
  <p class="p-assumption">Select a case to update its status. Agreed changes flow through to Spend.</p></div>
  ${ui.detailOpen ? `<aside class="p-detail" id="p-detail" aria-label="Selected case details">${detailMarkup()}</aside>` : ''}</div>`;
}

function renderSpend() {
  const totals = computeSpend(products, ui.statuses);
  const remaining = totals.potential - totals.agreed;
  $('#p-view').innerHTML = `
    <div class="p-metrics">
      <div class="p-metric"><span class="p-label">Baseline spend · 12 months</span><div class="p-value">${eur(totals.current)}</div><p>${products.length} products across ${suppliers.length} manufacturers</p></div>
      <div class="p-metric"><span class="p-label">Agreed annual reduction</span><div class="p-value p-positive">${reduction(totals.agreed)}</div><p>${products.filter(product => status(product) === 'Agreed').length} ${products.filter(product => status(product) === 'Agreed').length === 1 ? 'price change agreed' : 'price changes agreed'}</p></div>
      <div class="p-metric p-metric-primary"><span class="p-label">Spend after agreed changes</span><div class="p-value" id="p-projection">${eur(totals.projected)}</div><p>Same volumes, with agreed target prices</p></div>
    </div>
    <div class="p-opportunity"><div><span class="p-label">Remaining opportunity</span><strong>${eur(remaining)}</strong></div><p>${eur(totals.potential)} total identified opportunity, including ${eur(totals.agreed)} already agreed. Pending opportunities are not included in projected spend.</p></div>
    <section class="p-list p-spendtable" aria-label="Spend by manufacturer">
      <div class="p-listtitle"><strong>Spend by manufacturer</strong><span class="p-count">Next 12 months · fixed-volume scenario</span></div>
      <div class="p-scroll"><table><thead><tr><th scope="col">Manufacturer</th><th scope="col" class="p-num">Baseline</th><th scope="col" class="p-num">Agreed reduction</th><th scope="col" class="p-num">After changes</th><th scope="col" class="p-num">Still open</th></tr></thead><tbody>
      ${suppliers.map(supplier => {
        const rows = products.filter(product => product.supplier === supplier);
        const group = computeSpend(rows, ui.statuses);
        return `<tr><td><strong>${escape(supplier)}</strong><span class="p-code">${rows.length} products</span></td><td class="p-num">${eur(group.current)}</td><td class="p-num p-positive">${reduction(group.agreed)}</td><td class="p-num">${eur(group.projected)}</td><td class="p-num">${eur(group.potential - group.agreed)}</td></tr>`;
      }).join('')}
      <tr class="p-total"><td>Total</td><td class="p-num">${eur(totals.current)}</td><td class="p-num p-positive">${reduction(totals.agreed)}</td><td class="p-num">${eur(totals.projected)}</td><td class="p-num">${eur(remaining)}</td></tr>
      </tbody></table></div>
    </section>
    <details class="p-spendnotes"><summary>Calculation notes · fixed volumes, not realized savings</summary><p>All figures use fictional prices and fixed 12-month volumes. Agreed changes assume the full example volume moves to the target price, without additional costs. These are planning scenarios, not realized savings.</p><p>Moving a case to <strong>Agreed</strong> applies its example target price here. Reopening it removes that reduction. Cases marked <strong>No action</strong> are excluded from opportunity totals.</p></details>`;
}

function render() {
  const [title, subtitle] = views[ui.view];
  $('#p-title').textContent = title;
  $('#p-subtitle').textContent = subtitle;
  $('#p-location').textContent = title;
  $('#p-viewmeta').textContent = ui.view === 'products' ? `${suppliers.length} manufacturers · ${products.length} products` : ui.view === 'workflow' ? `${openProducts().length} open cases` : '12-month outlook · EUR';
  $('#p-open-count').textContent = products.filter(product => !['Agreed', 'No action'].includes(status(product))).length;
  for (const button of root.querySelectorAll('[data-view]')) {
    if (button.dataset.view === ui.view) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  }
  document.title = `Procus — ${title}`;
  if (ui.view === 'products') renderProducts();
  else if (ui.view === 'workflow') renderWorkflow();
  else renderSpend();
}

root.addEventListener('click', event => {
  const view = event.target.closest('[data-view]');
  if (view) {
    ui.view = view.dataset.view;
    ui.draft = false;
    ui.detailOpen = false;
    render();
    save();
    return;
  }
  const product = event.target.closest('[data-product]');
  if (product) {
    ui.selected = product.dataset.product;
    ui.draft = false;
    ui.detailOpen = true;
    render();
    root.querySelector(`[data-product="${ui.selected}"]`)?.focus({ preventScroll: true });
    revealDetail();
    save();
    return;
  }
  if (event.target.closest('#p-review-next')) {
    const next = openProducts().sort((a, b) => saving(b) - saving(a))[0];
    if (!next) return;
    ui.selected = next.id;
    ui.detailOpen = true;
    ui.query = '';
    ui.onlyFlags = false;
    ui.statusFilter = 'all';
    ui.collapsed = ui.collapsed.filter(supplier => supplier !== next.supplier);
    render();
    $('#p-detailstatus').focus({ preventScroll: true });
    revealDetail();
    save();
    return;
  }
  if (event.target.closest('#p-close-detail')) {
    ui.detailOpen = false;
    ui.draft = false;
    render();
    root.querySelector(`[data-product="${ui.selected}"]`)?.focus({ preventScroll: true });
    return;
  }
  const supplier = event.target.closest('[data-supplier]');
  if (supplier) {
    const name = supplier.dataset.supplier;
    ui.collapsed = ui.collapsed.includes(name) ? ui.collapsed.filter(value => value !== name) : [...ui.collapsed, name];
    renderRows();
    root.querySelector(`[data-supplier="${name}"]`)?.focus({ preventScroll: true });
    save();
    return;
  }
  if (event.target.closest('#p-draftbutton')) {
    ui.draft = !ui.draft;
    $('#p-detail').innerHTML = detailMarkup();
    $('#p-draftbutton')?.focus({ preventScroll: true });
    save();
  }
});

root.addEventListener('input', event => {
  if (event.target.id !== 'p-search') return;
  ui.query = event.target.value;
  renderRows();
  save();
});

root.addEventListener('change', event => {
  if (event.target.id === 'p-onlyflags') {
    ui.onlyFlags = event.target.checked;
    renderRows();
    save();
  } else if (event.target.id === 'p-statusfilter') {
    ui.statusFilter = event.target.value;
    renderRows();
    save();
  } else if (event.target.id === 'p-detailstatus') {
    ui.statuses[ui.selected] = event.target.value;
    render();
    $('#p-detailstatus').focus({ preventScroll: true });
    $('#p-saved').textContent = save() ? 'Saved in this browser.' : 'Updated for this session. Browser storage is unavailable.';
  }
});

render();
