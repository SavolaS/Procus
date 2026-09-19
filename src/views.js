import { evidenceStrip } from './evidence.js';
import { products, suppliers, states, months, period, signalTypes, agents, activity, conversations } from './data.js';
import {
  getStatus, potentialSaving, annualSpend, alertLevel, isOpen, computeSpend,
  alertCounts, pipeline, categoryTotals, spendSeries, openStates, realisedSaving, trend,
} from './model.js';
import { sparkline, priceChart, spendChart, bar } from './chart.js';

export const eur = value => new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
const unitPrice = value => new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: value < 1 ? 3 : 2 }).format(value);
const integer = value => new Intl.NumberFormat('en-IE').format(value);
const percent = value => `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(value).toFixed(1)}%`;
const initials = name => name.split(' ').map(part => part[0]).join('').slice(0, 2);
const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

const forecastLabels = [...months, 'Oct', 'Nov', 'Dec'];
const alertMeta = {
  critical: { label: 'Critical', note: 'Act this week' },
  warning: { label: 'Warning', note: 'Review this month' },
  watch: { label: 'Watch', note: 'Monitoring' },
};

const status = (product, ui) => getStatus(product, ui.statuses);
const saving = product => potentialSaving(product);
const openItems = ui => products.filter(product => isOpen(product, ui.statuses));
const rank = product => ({ critical: 0, warning: 1, watch: 2 }[alertLevel(product)] ?? 3);
const byPriority = (a, b) => rank(a) - rank(b) || saving(b) - saving(a);
export const topOpportunity = ui => openItems(ui).sort(byPriority)[0] ?? null;

function badge(level, size = '') {
  if (!level) return '<span class="p-badge p-badge--quiet">Monitoring</span>';
  return `<span class="p-badge p-badge--${level}${size}">${alertMeta[level].label}</span>`;
}

// A case that has been agreed or dismissed is resolved: it reports its outcome,
// not the severity of the signal that started it.
function signalBadge(product, ui) {
  const state = status(product, ui);
  if (!product.signal) return '<span class="p-badge p-badge--quiet">Monitoring</span>';
  if (state === 'Agreed' || state === 'No action') return '';
  if (state === 'No action') return '<span class="p-badge p-badge--quiet">Dismissed</span>';
  return badge(alertLevel(product));
}

function statusPill(value) {
  return `<span class="p-pill" data-state="${esc(value)}">${esc(value)}</span>`;
}

function trendCell(product) {
  const { direction } = trend(product);
  const arrow = direction === 'up' ? '▲' : direction === 'down' ? '▼' : '▬';
  return `<span class="p-trend" data-direction="${direction}" title="Unit price ${unitPrice(product.history[0])} → ${unitPrice(product.price)} over 12 months">
    ${sparkline(product.history, direction)}<span class="p-trend__value"><span aria-hidden="true">${arrow}</span>${percent(product.change)}</span></span>`;
}

function card(title, body, { meta = '', action = '', wide = false, id = '' } = {}) {
  return `<article class="p-card${wide ? ' p-card--wide' : ''}"${id ? ` id="${id}"` : ''}>
    <header class="p-card__head"><h2>${title}</h2>${meta ? `<span class="p-card__meta">${meta}</span>` : ''}${action}</header>
    ${body}</article>`;
}

function kpi({ label, value, note, tone = '', foot = '' }) {
  return `<article class="p-kpi${tone ? ` p-kpi--${tone}` : ''}">
    <span class="p-kpi__label">${label}</span>
    <strong class="p-kpi__value">${value}</strong>
    <span class="p-kpi__note">${note}</span>${foot}</article>`;
}

/* ---------------------------------------------------------------- Overview */

function agentFinding(ui, compact = false) {
  const candidates = openItems(ui).filter(p => p.signal === 'increase');
  const product = candidates.find(p => p.negotiation) ?? candidates.sort(byPriority)[0];
  if (!product) return '';
  return `<section class="p-finding p-finding--evidence" aria-label="Agent price alert"><div class="p-finding__top">
    <span class="p-finding__symbol" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 16V8l8-4 8 4v8l-8 4-8-4Z"/><path d="m8 13 3-3 3 2 3-5"/></svg></span>
    <div class="p-finding__body"><p class="p-finding__eyebrow">Price Watch <span>·</span> Price increase flagged</p>
      <h2>${esc(product.name)} is up ${product.change.toFixed(1)}%</h2>
      <p>${esc(product.supplier)} · ${product.id} <span class="p-finding__divider">/</span> ${product.assembly ? esc(product.assembly) : `${eur(saving(product))} potential annual saving`}</p></div>
    <button type="button" class="p-button p-button--brand" data-generate="${product.id}">Generate framework <span aria-hidden="true">→</span></button></div>
    ${!compact && product.negotiation ? evidenceStrip(product) : ''}
    ${compact ? '' : `<div class="p-finding__foot"><span>${product.negotiation ? 'Recommended for negotiation · comparisons need buyer validation' : 'Review the evidence before approaching your supplier'}</span><button type="button" class="p-link" data-goto="products" data-product="${product.id}">View part evidence →</button></div>`}
  </section>`;
}

function overview(ui) {
  const totals = computeSpend(products, ui.statuses);
  const counts = alertCounts(products, ui.statuses);
  const stages = pipeline(products, ui.statuses, states);
  const priority = [...openItems(ui)].sort(byPriority).slice(0, 5);
  const running = agents.filter(a => a.state === 'running' && !ui.paused.includes(a.id)).length;
  return `<div class="p-kpis">
    ${kpi({ label: 'Products monitored', value: `${products.length}<small> / ${products.length}</small>`, note: `${suppliers.length} suppliers · entire portfolio in scope` })}
    ${kpi({ label: 'Open opportunity', value: eur(totals.remaining), note: 'Potential annual savings · not yet agreed' })}
    ${kpi({ label: 'Agreed savings', value: eur(totals.agreed), note: `${eur(totals.realised)} realised on invoices`, tone: 'success' })}
    ${kpi({ label: 'Active negotiations', value: String(stages[2].items.length), note: `${counts.critical} critical price signals to review` })}
  </div>
  ${agentFinding(ui)}
  <div class="p-grid p-grid--overview">
    ${card('Priority parts', `<div class="p-prioritylabels"><span>Part / supplier</span><span>Annual opportunity</span></div><ol class="p-alertlist">
      ${priority.map(product => `<li><button type="button" data-goto="products" data-product="${product.id}">
        <span class="p-alertlist__main"><strong>${esc(product.name)}</strong><span class="p-alertlist__sub">${product.id} · ${esc(product.supplier)}</span></span>
        <span class="p-alertlist__value">${eur(saving(product))}<small>${percent(product.change)} price change</small></span>
      </button></li>`).join('') || '<li class="p-empty">No open signals. All parts remain monitored.</li>'}</ol>`, { meta: `${counts.total} open signals`, action: '<button type="button" class="p-button p-button--quiet" data-goto="products">View parts →</button>' })}
    ${card('Negotiation pipeline', `<ol class="p-pipeline">${stages.filter(s => s.state !== 'No action').map(stage => `<li>
      <button type="button" data-goto="products" data-status="${esc(stage.state)}">
        ${statusPill(stage.state)}<span class="p-pipeline__count">${stage.items.length}</span><strong>${eur(stage.value)}</strong>
      </button></li>`).join('')}</ol><p class="p-panelnote">Potential and agreed annual impact by stage.</p>`, {action: '<button type="button" class="p-button p-button--quiet" data-goto="workflow">View all →</button>'})}
  </div>
  <div class="p-grid p-grid--overview">
    ${card('Purchasing spend', spendChart(spendSeries(products, ui.statuses), months, forecastLabels), {
      meta: 'Monthly · EUR', action: '<button type="button" class="p-button p-button--quiet" data-goto="spend">View report →</button>',
    })}
    ${card('Agent activity', `<ul class="p-agentmini">${agents.slice(0, 4).map(agent => {
      const state = ui.paused.includes(agent.id) ? 'paused' : agent.state;
      return `<li><span class="p-agentmini__main"><strong>${esc(agent.name)}</strong><span>${esc(state === 'paused' ? 'Paused by you. Findings are retained.' : agent.now)}</span></span><span class="p-state" data-state="${state}">${state}</span></li>`;
    }).join('')}</ul>`, { meta: `${running} running`, action: '<button type="button" class="p-button p-button--quiet" data-goto="agents">Manage →</button>' })}
  </div>`;
}

/* -------------------------------------------------------------- Products */

function visibleProducts(ui) {
  const query = ui.query.trim().toLowerCase();
  return products.filter(product =>
    (!query || `${product.name} ${product.id} ${product.supplier} ${product.category} ${product.assembly ?? ''}`.toLowerCase().includes(query)) &&
    (ui.alertFilter === 'all' || (isOpen(product, ui.statuses) && alertLevel(product) === ui.alertFilter)) &&
    (ui.statusFilter === 'all' || status(product, ui) === ui.statusFilter));
}

export function productRows(ui) {
  const visible = visibleProducts(ui);
  const filtered = ui.query || ui.alertFilter !== 'all' || ui.statusFilter !== 'all';
  let html = '';
  for (const supplier of suppliers) {
    const rows = visible.filter(product => product.supplier === supplier.name);
    if (!rows.length) continue;
    const collapsed = ui.collapsed.includes(supplier.name) && !filtered;
    const totals = computeSpend(rows, ui.statuses);
    const counts = alertCounts(rows, ui.statuses);
    html += `<tr class="p-row p-row--supplier">
      <td colspan="2"><button type="button" data-supplier="${esc(supplier.name)}" aria-expanded="${!collapsed}">
        <span class="p-caret" data-open="${!collapsed}" aria-hidden="true"></span>
        <span class="p-row__supplier"><strong>${esc(supplier.name)}</strong>
        <span class="p-row__sub">${esc(supplier.country)} · ${esc(supplier.focus)} · ${rows.length} ${rows.length === 1 ? 'part' : 'parts'}</span></span></button></td>
      <td class="p-num">${eur(totals.current)}</td>
      <td><span class="p-quiet">${counts.total} open signals</span></td>
      <td></td>
      <td class="p-num">${totals.potential ? `<strong>${eur(totals.potential)}</strong>` : '—'}</td></tr>`;
    if (collapsed) continue;
    for (const product of rows) {
      const level = isOpen(product, ui.statuses) ? alertLevel(product) : null;
      const value = status(product, ui) === 'No action' ? 0 : saving(product);
      const selected = ui.detailOpen && ui.selected === product.id;
      html += `<tr class="p-row${selected ? ' is-selected' : ''}" data-level="${level ?? ''}">
        <td class="p-cell--name"><button type="button" data-product="${product.id}" aria-pressed="${selected}">
          <span class="p-row__name">${esc(product.name)}</span>
          <span class="p-row__sub">${product.id} · ${esc(product.assembly ?? product.category)}</span></button></td>
        <td>${trendCell(product)}</td>
        <td class="p-num">${eur(annualSpend(product))}</td>
        <td>${product.signal
          ? `<span class="p-signal">${signalBadge(product, ui)}<span class="p-signal__text">${esc(signalTypes[product.signal].short)}</span></span>`
          : '<span class="p-quiet">—</span>'}</td>
        <td>${statusPill(status(product, ui))}</td>
        <td class="p-num${value ? ' p-num--positive' : ''}">${value ? eur(value) : '—'}</td></tr>`;
    }
  }
  return { html: html || `<tr><td colspan="6" class="p-empty">No parts match these filters.<button type="button" class="p-button" data-reset="1">Clear filters</button></td></tr>`, count: visible.length };
}

function productsView(ui) {
  const counts = alertCounts(products, ui.statuses);
  const next = topOpportunity(ui);
  const chips = [['all', `All parts`, products.length], ...['critical', 'warning', 'watch'].map(level => [level, alertMeta[level].label, counts[level]])];
  return `
  <div class="p-alertbar" role="group" aria-label="Filter by alert severity">
    ${chips.map(([value, label, count]) => `<button type="button" class="p-alertbar__chip${ui.alertFilter === value ? ' is-active' : ''}" data-alert="${value}" aria-pressed="${ui.alertFilter === value}">
      <span>${label}</span><span class="p-alertbar__count">${count}</span></button>`).join('')}
    ${next ? `<button type="button" class="p-button p-button--quiet p-alertbar__next" id="p-review-next">
      Review priority part →</button>` : ''}
  </div>

  <div class="p-toolbar">
    <label class="p-search"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5"/><path d="m13 13 4 4"/></svg>
      <input id="p-search" type="search" placeholder="Search parts, codes, suppliers or categories" aria-label="Search parts, codes, suppliers or categories" value="${esc(ui.query)}"></label>
    <div class="p-toolbar__right">
      <label class="p-field"><span>Status</span>
        <select id="p-statusfilter"><option value="all">All statuses</option>${states.map(value => `<option${value === ui.statusFilter ? ' selected' : ''}>${value}</option>`).join('')}</select></label>
      <span class="p-count" id="p-resultcount"></span>
    </div>
  </div>

  <div class="p-work${ui.detailOpen ? ' has-detail' : ''}">
    <section class="p-card p-card--table" aria-label="Suppliers and parts">
      <div class="p-tablewrap" tabindex="0" aria-label="Parts table, scroll for more columns"><table class="p-table--parts"><colgroup><col class="p-col-part"><col class="p-col-trend"><col class="p-col-money"><col class="p-col-signal"><col class="p-col-status"><col class="p-col-money"></colgroup>
        <thead><tr>
          <th scope="col">Part / supplier</th><th scope="col">12-month price trend</th>
          <th scope="col" class="p-num">Annual spend</th><th scope="col">Signal</th>
          <th scope="col">Status</th><th scope="col" class="p-num">Opportunity</th>
        </tr></thead>
        <tbody id="p-rows"></tbody>
      </table></div>
      <footer class="p-card__foot"><span>All amounts in EUR at fixed annual volumes</span><span>Supplier totals follow the filters above</span></footer>
    </section>
    ${ui.detailOpen ? detailPanel(ui) : ''}
  </div>`;
}

/* -------------------------------------------------------------- Workflow */

function workflowView(ui) {
  const stages = pipeline(products, ui.statuses, states);
  const active = stages.filter(stage => stage.state !== 'No action');
  const totalValue = active.reduce((sum, stage) => sum + stage.value, 0);
  const stalled = active.reduce((sum, stage) => sum + stage.stalled.length, 0);
  return `
  <div class="p-kpis p-kpis--slim">
    ${kpi({ label: 'In the pipeline', value: String(active.reduce((sum, stage) => sum + stage.items.length, 0)), note: 'Parts with an open or agreed case' })}
    ${kpi({ label: 'Value in progress', value: eur(totalValue), note: 'Annual impact across all stages', tone: 'opportunity' })}
    ${kpi({ label: 'Agreed this period', value: eur(stages[3].value), note: `${stages[3].items.length} price changes confirmed`, tone: 'success' })}
    ${kpi({ label: 'Waiting over 21 days', value: String(stalled), note: stalled ? 'Cases losing momentum' : 'Nothing is stalled', tone: stalled ? 'alert' : '' })}
  </div>

  ${agentFinding(ui, true)}
  <div class="p-work${ui.detailOpen ? ' has-detail' : ''}">
    <div class="p-board">
      ${stages.map(stage => {
        const isQuiet = stage.state === 'No action';
        const resolved = stage.state === 'Agreed';
        const list = [...stage.items].sort(byPriority);
        const owners = stage.owners.length > 2 ? `${stage.owners.length} people` : stage.owners.map(esc).join(', ') || '—';
        return `<section class="p-lane${isQuiet ? ' p-lane--quiet' : ''}" aria-label="${esc(stage.state)}">
        <header class="p-lane__head">
          <div class="p-lane__title">${statusPill(stage.state)}<span class="p-lane__count">${stage.items.length}</span></div>
          <p class="p-lane__value">${stage.value ? `${eur(stage.value)} annual impact` : 'No open value'}</p>
          <p class="p-lane__summary">${isQuiet ? 'Reviewed and monitored' : resolved ? 'Verify on the next invoice' : `${stage.stalled.length} waiting over 21 days`}</p>
        </header>
        <div class="p-lane__cards">
        ${list.map(product => {
          const level = isOpen(product, ui.statuses) ? alertLevel(product) : null;
          const selected = ui.detailOpen && ui.selected === product.id;
          const mark = level === 'critical' ? badge(level, ' p-badge--mini') : '';
          return `<button type="button" class="p-case${selected ? ' is-selected' : ''}" data-product="${product.id}" aria-pressed="${selected}">

            <span class="p-case__top"><span class="p-case__supplier">${esc(product.supplier)}</span>${mark}</span>
            <strong>${esc(product.name)}</strong>
            <span class="p-case__meta">${product.id} · ${esc(product.signal ? signalTypes[product.signal].short : 'Monitoring')}</span>
            <span class="p-case__foot">
              <span class="p-case__value">${!isQuiet && saving(product) ? eur(saving(product)) : '—'}</span>
              ${isQuiet ? '' : `<span class="p-case__owner" title="${esc(product.owner)} · ${product.daysInStage} days in stage">
                <span class="p-avatar p-avatar--mini">${esc(initials(product.owner))}</span>${product.daysInStage}d</span>`}
            </span></button>`;
        }).join('') || '<p class="p-lane__empty">No cases at this stage.</p>'}
        </div></section>`;
      }).join('')}
    </div>
    ${ui.detailOpen ? detailPanel(ui) : ''}
  </div>
  <p class="p-note">Select a case to change its stage. Moving a case to <strong>Agreed</strong> applies its reference price to the spend projection.</p>`;
}

/* ---------------------------------------------------------------- Agents */

const conversationState = {
  draft: { label: 'Draft ready', tone: 'warning' },
  awaiting: { label: 'Awaiting reply', tone: 'watch' },
  replied: { label: 'Supplier replied', tone: 'warning' },
  issue: { label: 'Needs a decision', tone: 'critical' },
  agreed: { label: 'Agreed', tone: 'success' },
};
const needsLabel = { approval: 'Approval needed', decision: 'Decision needed', input: 'Unclear — needs your input' };

function agentsView(ui) {
  const queue = conversations.filter(entry => entry.needs && !ui.handled.includes(entry.id));
  const running = agents.filter(agent => !ui.paused.includes(agent.id) && agent.state === 'running').length;
  const found = agents.reduce((sum, agent) => sum + agent.found, 0);
  const checked = agents.reduce((sum, agent) => sum + agent.checked, 0);

  return `
  <div class="p-kpis p-kpis--slim">
    ${kpi({ label: 'Agents running', value: `${running} of ${agents.length}`, note: 'Working continuously on your data' })}
    ${kpi({ label: 'Lines checked today', value: integer(checked), note: 'Price lists, invoices and orders' })}
    ${kpi({ label: 'Signals raised', value: String(found), note: `${alertCounts(products, ui.statuses).total} still open, the rest agreed or dismissed`, tone: 'opportunity' })}
    ${kpi({ label: 'Waiting on you', value: String(queue.length), note: queue.length ? 'Agents are blocked until you decide' : 'Nothing is blocked', tone: queue.length ? 'alert' : 'success' })}
  </div>

  <div class="p-grid p-grid--2">
    ${card('Agent roster', `<ul class="p-agents">
      ${agents.map(agent => {
        const paused = ui.paused.includes(agent.id);
        const state = paused ? 'paused' : agent.state;
        return `<li class="p-agent" data-state="${state}">
        <div class="p-agent__head">
          <span class="p-state" data-state="${state}">${state}</span>
          <strong>${esc(agent.name)}</strong>
          <span class="p-agent__last">Last run ${esc(agent.lastRun)}</span>
        </div>
        <p class="p-agent__role">${esc(agent.role)}</p>
        <p class="p-agent__now"><span>${paused ? 'Paused' : state === 'blocked' ? 'Blocked' : 'Now'}</span>${esc(paused ? 'Paused by you. Findings are kept and it resumes where it stopped.' : agent.now)}</p>
        <div class="p-agent__foot">
          <span class="p-agent__stat"><strong>${integer(agent.checked)}</strong> checked</span>
          <span class="p-agent__stat"><strong>${agent.found}</strong> raised</span>
          <button type="button" class="p-button p-button--quiet" data-agent="${agent.id}">${paused ? 'Resume' : 'Pause'}</button>
        </div></li>`;
      }).join('')}
    </ul>`, { meta: `${running} running` })}

    <div class="p-agent-work">
  ${queue.length ? card('Waiting for your decision', `<ul class="p-queue">
    ${queue.map(entry => `<li class="p-queue__item" data-need="${entry.needs}"><details>
      <summary class="p-queue__head">
        <span class="p-badge p-badge--${entry.needs === 'input' ? 'critical' : 'warning'}">${needsLabel[entry.needs]}</span>
        <span class="p-queue__where">${esc(entry.supplier)} · ${esc(entry.subject)}</span>
        <span class="p-queue__time">${esc(entry.updated)}</span>
      </summary>
      <p class="p-queue__ask">${esc(entry.ask)}</p>
      <div class="p-queue__actions">
        <button type="button" class="p-button p-button--brand" data-resolve="${entry.id}" data-choice="approve">${entry.needs === 'approval' ? 'Approve draft (demo)' : entry.needs === 'input' ? 'Confirm and continue' : 'Accept agent recommendation'}</button>
        <button type="button" class="p-button" data-resolve="${entry.id}" data-choice="handover">Take over myself</button>
        <button type="button" class="p-button p-button--quiet" data-resolve="${entry.id}" data-choice="dismiss">Not now</button>
        ${entry.product ? `<button type="button" class="p-button p-button--quiet" data-goto="products" data-product="${entry.product}">Open ${entry.product}</button>` : ''}
      </div></details></li>`).join('')}
  </ul>`, { meta: `${queue.length} blocked`, wide: true }) : `<div class="p-banner p-banner--success" role="status">
    <span class="p-banner__icon" aria-hidden="true">✓</span><p><strong>Nothing is waiting on you.</strong> Every agent decision has been handled — new ones will appear here.</p></div>`}

    ${card('Supplier conversations', `<ul class="p-threads">
      ${conversations.map(entry => {
        const resolved = ui.handled.includes(entry.id);
        const meta = resolved ? { label: 'Handled by you', tone: 'success' } : conversationState[entry.state];
        const open = ui.thread === entry.id;
        return `<li class="p-thread${open ? ' is-open' : ''}">
        <button type="button" class="p-thread__head" data-thread="${entry.id}" aria-expanded="${open}">
          <span class="p-caret" data-open="${open}" aria-hidden="true"></span>
          <span class="p-thread__main"><strong>${esc(entry.supplier)}</strong><span>${esc(entry.subject)}</span></span>
          <span class="p-badge p-badge--${meta.tone}">${meta.label}</span>
          <span class="p-thread__time">${esc(entry.updated)}</span>
        </button>
        ${open ? `<ol class="p-messages">
          ${entry.messages.map(message => `<li class="p-message" data-from="${message.from}">
            <span class="p-message__who">${message.from === 'agent' ? `Procus · ${esc(entry.agent)}` : esc(entry.supplier)}<small>${esc(message.when)}</small></span>
            <p>${esc(message.text)}</p></li>`).join('')}
        </ol>` : ''}</li>`;
      }).join('')}
    </ul>`, { meta: `${conversations.length} threads` })}
    </div>
  </div>

  ${card('Activity today', `<ol class="p-timeline">
    ${activity.map(entry => `<li class="p-timeline__item" data-kind="${entry.kind}">
      <span class="p-timeline__time">${esc(entry.time)}</span>
      <span class="p-timeline__dot" aria-hidden="true"></span>
      <div><p>${esc(entry.text)}</p><span class="p-timeline__agent">${esc(entry.agent)}${entry.product ? ` · <button type="button" class="p-link" data-goto="products" data-product="${entry.product}">${entry.product}</button>` : ''}</span></div>
    </li>`).join('')}
  </ol>`, { meta: 'Newest first', wide: true })}`;
}

/* ----------------------------------------------------------------- Spend */

function spendView(ui) {
  const totals = computeSpend(products, ui.statuses);
  const series = spendSeries(products, ui.statuses);
  const categories = categoryTotals(products, ui.statuses);
  const biggest = categories[0].current;
  const rows = suppliers.map(supplier => {
    const items = products.filter(product => product.supplier === supplier.name);
    return { supplier, items, ...computeSpend(items, ui.statuses) };
  }).sort((a, b) => b.current - a.current);

  return `
  <div class="p-kpis">
    ${kpi({ label: 'Baseline spend · 12 months', value: eur(totals.current), note: `${products.length} parts at today's prices and fixed volumes` })}
    ${kpi({ label: 'Identified opportunity', value: eur(totals.potential), note: `${eur(totals.remaining)} of it not yet agreed`, tone: 'opportunity' })}
    ${kpi({ label: 'Agreed reduction', value: `−${eur(totals.agreed)}`, note: 'Price changes confirmed with suppliers · annual run rate', tone: 'success' })}
    ${kpi({ label: 'Realised on invoices', value: `−${eur(totals.realised)}`, note: 'Actually paid at the agreed price so far', tone: 'success' })}
  </div>

  ${card('Spend trend and opportunity', spendChart(series, months, forecastLabels), {
    meta: `Monthly · ${period.start} – ${period.end} · 3 months projected`, wide: true,
  })}

  <div class="p-grid p-grid--wide">
    ${card('Spend by supplier', `<div class="p-tablewrap" tabindex="0" aria-label="Supplier spend table, scroll for more columns"><table class="p-table--spend"><colgroup><col class="p-col-supplier"><col class="p-col-money"><col class="p-col-money"><col class="p-col-money"><col class="p-col-money"><col class="p-col-share"></colgroup>
      <thead><tr><th scope="col">Supplier</th><th scope="col" class="p-num">Baseline</th><th scope="col" class="p-num">Agreed</th>
        <th scope="col" class="p-num">After changes</th><th scope="col" class="p-num">Still open</th><th scope="col" class="p-num">Share of spend</th></tr></thead>
      <tbody>
      ${rows.map(row => `<tr class="p-row">
        <td><span class="p-row__name">${esc(row.supplier.name)}</span><span class="p-row__sub">${esc(row.supplier.country)} · ${row.items.length} parts · ${esc(row.supplier.contract)}</span></td>
        <td class="p-num">${eur(row.current)}</td>
        <td class="p-num${row.agreed ? ' p-num--positive' : ''}">${row.agreed ? `−${eur(row.agreed)}` : '—'}</td>
        <td class="p-num">${eur(row.projected)}</td>
        <td class="p-num">${row.remaining ? eur(row.remaining) : '—'}</td>
        <td class="p-cell--bar"><span class="p-share">${bar(row.current / totals.current, 0, `${(row.current / totals.current * 100).toFixed(1)} per cent of total spend`)}
          <span class="p-bar__label">${(row.current / totals.current * 100).toFixed(1)}%</span></span></td></tr>`).join('')}
      <tr class="p-row p-row--total"><td>Total</td><td class="p-num">${eur(totals.current)}</td>
        <td class="p-num p-num--positive">−${eur(totals.agreed)}</td><td class="p-num">${eur(totals.projected)}</td>
        <td class="p-num">${eur(totals.remaining)}</td><td></td></tr>
      </tbody></table></div>`, { meta: `${suppliers.length} suppliers`, wide: true })}
  </div>

  ${card('Spend by category', `<div class="p-categorylabels"><span>Category</span><span>Relative spend</span><span>Annual spend</span><span>Opportunity</span></div><ul class="p-categories">
    ${categories.map(entry => `<li>
      <span class="p-categories__name">${esc(entry.category)}<small>${entry.count} ${entry.count === 1 ? 'part' : 'parts'}</small></span>
      ${bar(entry.current / biggest, entry.potential / biggest, `${eur(entry.current)} annual spend, ${entry.potential ? eur(entry.potential) : 'no'} opportunity`)}
      <span class="p-categories__value">${eur(entry.current)}</span>
      <span class="p-categories__opportunity">${entry.potential ? eur(entry.potential) : '—'}</span></li>`).join('')}
  </ul>
  <p class="p-note"><span class="p-swatch" data-kind="spend"></span>Annual spend <span class="p-swatch" data-kind="opportunity"></span>Identified opportunity</p>`, { wide: true })}

  <details class="p-notes"><summary>How these figures are calculated</summary>
    <p>Annual projections use twelve-month purchase volumes. Opportunity assumes that volume moves to the reference price, before additional freight, tooling or qualification costs. Projected and realised savings are reported separately.</p>
    <p>Moving a case to <strong>Agreed</strong> applies its reference price to the projection. Reopening it removes the reduction. Cases marked <strong>No action</strong> are excluded from opportunity totals. Agreed savings are part of the identified opportunity, never added on top of it.</p>
    <p>Three figures are deliberately kept apart. <strong>Identified</strong> is what the evidence suggests is available. <strong>Agreed</strong> is what a supplier has confirmed, expressed as an annual run rate. <strong>Realised</strong> counts only months where purchases have actually been invoiced at the agreed price, so an agreement nobody has ordered against yet contributes nothing.</p>
  </details>`;
}

/* ---------------------------------------------------------------- Detail */

export function detailPanel(ui) {
  const product = products.find(entry => entry.id === ui.selected);
  if (!product) return '';
  const current = status(product, ui);
  const level = isOpen(product, ui.statuses) ? alertLevel(product) : null;
  const supplier = suppliers.find(entry => entry.name === product.supplier);
  const thread = conversations.find(entry => entry.product === product.id);
  const value = current === 'No action' ? 0 : saving(product);

  return `<div class="p-drawer-shade" data-close-detail="true"></div><aside class="p-detail" id="p-detail" role="dialog" aria-modal="true" tabindex="-1" aria-label="Details for ${esc(product.name)}">
    <header class="p-detail__head">
      <div class="p-detail__bar"><span>Part detail</span>
        <button type="button" class="p-iconbutton" id="p-close-detail" aria-label="Close part detail">×</button></div>
      <h2>${esc(product.name)}</h2>
      <p class="p-detail__sub">${esc(product.supplier)} · ${product.id} · ${esc(product.category)}</p>
      ${level ? `<div class="p-detail__alert" data-level="${level}">${badge(level)}<span>${esc(signalTypes[product.signal].label)}</span></div>` : ''}
    </header>

    <section class="p-detail__section">
      ${product.negotiation ? evidenceStrip(product) : ''}
      <h3>12-month unit price</h3>
      ${priceChart(product, product.target)}
      <p class="p-detail__change" data-direction="${trend(product).direction}">${percent(product.change)} over the period</p>
    </section>

    <section class="p-detail__section">
      <h3>${product.signal ? 'What Procus found' : 'Monitoring'}</h3>
      <p>${esc(product.why)}</p>
      <p class="p-detail__source">Evidence: ${esc(product.source)}</p>
    </section>

    <section class="p-detail__section">
      <h3>Annual impact</h3>
      <dl class="p-pairs">
        <div><dt>Volume</dt><dd>${integer(product.qty)} units</dd></div>
        <div><dt>Current price</dt><dd>${unitPrice(product.price)}</dd></div>
        ${product.target == null ? '' : `<div><dt>${current === 'Agreed' ? 'Agreed price' : 'Reference price'}</dt><dd>${unitPrice(product.target)}</dd></div>`}
        <div><dt>Annual spend</dt><dd>${eur(annualSpend(product))}</dd></div>
      </dl>
      ${product.target == null ? '<p class="p-detail__source">No savings opportunity identified.</p>' : `
        <div class="p-impact"><strong>−${eur(saving(product))}</strong>
          <span>${current === 'Agreed' ? 'Agreed annual impact' : 'Potential annual impact'}${value ? '' : ' · excluded from totals'}</span></div>`}
    </section>

    <section class="p-detail__section">
      <h3>Case</h3>
      <label class="p-field p-field--block" for="p-detailstatus"><span>Stage</span>
        <select id="p-detailstatus">${states.map(value => `<option${value === current ? ' selected' : ''}>${value}</option>`).join('')}</select></label>
      <p class="p-saved" id="p-saved" role="status"></p>
      <dl class="p-pairs">
        <div><dt>Owner</dt><dd>${esc(product.owner)}</dd></div>
        ${openStates.includes(current) && product.signal ? `<div><dt>In stage</dt><dd>${product.daysInStage} days</dd></div>` : ''}
        <div><dt>Terms</dt><dd>${esc(supplier.terms)}</dd></div>
        <div><dt>Agreement</dt><dd>${esc(supplier.contract)}</dd></div>
      </dl>
    </section>

    <section class="p-detail__section">
      <h3>Next step</h3>
      <p>${esc(current === 'Agreed'
        ? product.verifiedMonths
          ? `Confirmed on ${product.verifiedMonths} ${product.verifiedMonths === 1 ? 'month' : 'months'} of invoices at ${unitPrice(product.target)}. Keep checking each purchase order until the full year is covered.`
          : 'Agreed, but no purchases have been invoiced at the new price yet. Verify it on the next purchase order before counting the saving.'
        : product.next)}</p>
      ${current === 'Agreed' ? `<dl class="p-pairs p-pairs--tight">
        <div><dt>Agreed run rate</dt><dd>−${eur(saving(product))} a year</dd></div>
        <div><dt>Realised so far</dt><dd>${realisedSaving(product, ui.statuses) ? `−${eur(realisedSaving(product, ui.statuses))}` : 'Nothing yet'}</dd></div>
      </dl>` : ''}
      ${product.signal && isOpen(product, ui.statuses) ? `<button type="button" class="p-button p-button--brand p-detail__action" data-generate="${product.id}">Generate framework</button>` : ''}
      ${thread ? `<div class="p-detail__thread">
        <span class="p-badge p-badge--${ui.handled.includes(thread.id) ? 'success' : conversationState[thread.state].tone}">${ui.handled.includes(thread.id) ? 'Handled by you' : conversationState[thread.state].label}</span>
        <p>${esc(thread.messages[thread.messages.length - 1].text)}</p>
        <button type="button" class="p-button" data-goto="agents" data-thread="${thread.id}">Open conversation</button></div>`
      : ''}
    </section>
  </aside>`;
}

export const viewMeta = {
  overview: ['Overview', 'Make every product negotiable.'],
  products: ['Parts & suppliers', 'Price movements, supplier relationships and negotiation status.'],
  workflow: ['Workflow', 'Each opportunity from first signal through to an agreed price.'],
  agents: ['Agents', 'Portfolio intelligence and preparation. You lead the supplier relationship.'],
  spend: ['Spend', 'Annual purchasing spend, trend and the opportunity still open.'],
};

export const renderers = { overview, products: productsView, workflow: workflowView, agents: agentsView, spend: spendView };
