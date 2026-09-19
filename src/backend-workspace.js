import { products } from './data.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const text = value => Array.isArray(value) ? value.join('; ') : typeof value === 'object' && value ? JSON.stringify(value) : value;
const link = (url, label) => {
  try { if (!['https:', 'http:'].includes(new URL(url).protocol)) return ''; }
  catch { return ''; }
  return `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`;
};
const badge = label => {
  const tone = /failed|rejected|uncertain|interrupted/i.test(label) ? 'critical'
    : /unavailable|unqualified|unconfirmed/i.test(label) ? 'warning'
      : /completed|fetched snapshot/i.test(label) ? 'success'
        : /running|queued|submitting/i.test(label) ? 'info' : 'quiet';
  return `<span class="p-badge p-badge--${tone}">${esc(label)}</span>`;
};
const disabled = value => value ? ' disabled' : '';
const date = value => value && Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleString() : 'Not recorded';

export async function backendRequest(path, { token = '', body, fetchImpl = fetch, timeoutMs = path === 'indices/refresh' ? 180000 : 20000 } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(`/api/backend/${path}`, { cache: 'no-store', signal: controller.signal,
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { method: 'POST', body: JSON.stringify(body) } : {}) });
    let payload;
    try { payload = await response.json(); } catch (error) {
      if (controller.signal.aborted) throw error;
      throw new Error('The backend returned an invalid response. Check that the Procus server is running.');
    }
    if (!response.ok) throw Object.assign(new Error(text(payload.error) || `Request failed (HTTP ${response.status}).`), { status: response.status });
    return payload;
  } catch (error) {
    if (controller.signal.aborted) throw new Error('The backend request timed out. Reload to check the saved status before trying again.');
    throw error;
  } finally { clearTimeout(timeout); }
}

export function createBackendState() {
  return { config: null, runs: [], outbox: [], sources: [], productId: 'TM-105', specification: '', quantity: '', query: '', selectedDraft: null, busy: false, loading: true, error: '', notice: '', authenticated: false, contactConfirmed: false };
}

// Part requirements belong to the selected part; switching parts must not carry
// a previous drawing or annual volume into a new supplier search.
export function selectBackendPart(state, productId) {
  if (state.productId === productId) return;
  state.productId = productId;
  state.specification = '';
  state.quantity = '';
}

function focusKey(element) {
  if (!element) return null;
  if (element.dataset.backendField) return `field:${element.dataset.backendField}`;
  if (element.dataset.backendAction) return JSON.stringify(['action', element.dataset.backendAction, element.dataset.run, element.dataset.candidate, element.dataset.draft]);
  const detail = element.closest('[data-backend-detail]')?.dataset.backendDetail;
  if (element.localName === 'summary' && detail) return `summary:${detail}`;
  if (element.localName === 'a') return JSON.stringify(['link', detail, element.getAttribute('href')]);
  const form = element.closest('[data-backend-form]')?.dataset.backendForm;
  if (form) return JSON.stringify(['form', form, element.localName, element.name, element.type]);
  return element.id ? `id:${element.id}` : null;
}

export function captureBackendFocus(element) {
  const key = focusKey(element);
  return key ? { key, start: element.selectionStart, end: element.selectionEnd,
    direction: element.selectionDirection, scrollTop: element.scrollTop } : null;
}

export function restoreBackendFocus(container, snapshot) {
  if (!snapshot || !container) return false;
  const replacement = [...container.querySelectorAll('button, input, select, textarea, summary, a[href], [tabindex]')]
    .find(element => focusKey(element) === snapshot.key && !element.disabled);
  if (!replacement) return false;
  replacement.focus({ preventScroll: true });
  if (Number.isInteger(snapshot.start) && Number.isInteger(snapshot.end)
    && (replacement.localName === 'textarea' || ['text', 'search', 'tel', 'url', 'password'].includes(replacement.type))) {
    replacement.setSelectionRange(snapshot.start, snapshot.end, snapshot.direction);
    replacement.scrollTop = snapshot.scrollTop;
  }
  return true;
}

export function emailStatus(status) {
  return ({ draft: 'Draft · not sent', simulated: 'Simulated · no email sent', accepted: 'Accepted by email provider · delivery unconfirmed', sent: 'Submitted · delivery unconfirmed', sending: 'Submitting to provider', unknown: 'Submission uncertain · check provider before retrying', failed: 'Submission failed', rejected: 'Submission rejected' })[status] || status || 'Status unknown';
}

function candidateCard(candidate, run, state) {
  const sources = Array.isArray(candidate.sources) ? candidate.sources : [];
  const existing = state.outbox.find(draft => draft.runId === run.id && draft.candidateId === candidate.id);
  return `<article class="p-backend-candidate">
    <div class="p-backend-line"><h4>${esc(candidate.name)}</h4>${badge(candidate.mode === 'demo' || run.mode === 'demo' ? 'Demo supplier' : 'Unqualified candidate')}</div>
    <p>${esc(candidate.country)}${candidate.website ? ` · ${link(candidate.website, 'Website ↗')}` : ''}</p>
    <p>${esc(text(candidate.capability))}</p>
    <p><strong>Contact:</strong> ${esc(candidate.email || 'No public email found')} ${candidate.contactSource ? link(typeof candidate.contactSource === 'string' ? candidate.contactSource : candidate.contactSource.url, 'Contact source ↗') : ''}</p>
    <details class="p-backend-evidence" data-backend-detail="candidate-${esc(run.id)}-${esc(candidate.id)}"><summary>Evidence & qualification${sources.length ? ` · ${sources.length} source${sources.length === 1 ? '' : 's'}` : ''}</summary>
    <p class="p-backend-muted">${esc(text(candidate.qualification) || 'Part qualification is required.')} ${esc(text(candidate.uncertainty))}</p>
    ${sources.length ? `<ul class="p-backend-sources">${sources.map((source, index) => `<li>${link(typeof source === 'string' ? source : source.url, typeof source === 'string' ? `Source ${index + 1}` : source.title || source.label || `Source ${index + 1}`)}</li>`).join('')}</ul>` : '<p class="p-backend-muted">No independently verified sources recorded.</p>'}
    </details>
    <button type="button" class="p-button" data-backend-action="${existing ? 'preview' : 'draft'}" data-run="${esc(run.id)}" data-candidate="${esc(candidate.id)}" data-draft="${esc(existing?.id)}"${disabled(state.busy || !candidate.email)}>${existing ? 'Review RFQ' : 'Prepare RFQ'}</button>
  </article>`;
}

function results(state) {
  if (!state.runs.length) return '<p class="p-backend-empty">Start a supplier search to build a sourced shortlist and prepare an RFQ.</p>';
  return state.runs.map(run => `<details class="p-backend-run" data-backend-detail="run-${esc(run.id)}"${['queued', 'running'].includes(run.status) || state.runs[0] === run ? ' open' : ''}>
    <summary><strong>${esc(run.requirement?.name || run.productId)}</strong> ${badge(run.status)} <span>${esc(date(run.createdAt))}</span></summary>
    ${run.error ? `<p class="p-backend-error">${esc(text(run.error))}</p>` : ''}
    ${['queued', 'running'].includes(run.status) ? '<p class="p-backend-muted" role="status">Research is running. Results update automatically; you can leave this page.</p>' : ''}
    ${run.requirement?.specification ? `<p class="p-backend-muted">Requirement: ${esc(run.requirement.specification)}</p>` : ''}
    <div class="p-backend-candidates">${(run.candidates || []).map(candidate => candidateCard(candidate, run, state)).join('')}</div>
    ${run.status === 'completed' && !run.candidates?.length ? '<p>No suppliers matched the requirement. Refine the specification and try again.</p>' : ''}
  </details>`).join('');
}

function draftPreview(state) {
  const draft = state.outbox.find(item => item.id === state.selectedDraft);
  if (!draft) return '';
  const simulated = state.config?.mode !== 'live' || state.config?.email === 'simulated';
  return `<section class="p-backend-preview" id="p-backend-preview" aria-labelledby="p-backend-preview-title" tabindex="-1">
    <div class="p-backend-line"><h3 id="p-backend-preview-title">Review supplier RFQ</h3><button type="button" class="p-button p-button--quiet" data-backend-action="close-preview">Close preview</button></div>
    <p><strong>To:</strong> ${esc(draft.to)}</p><p><strong>Subject:</strong> ${esc(draft.subject)}</p>
    <pre>${esc(draft.body)}</pre><p>${badge(emailStatus(draft.status))}</p>${draft.error ? `<p class="p-backend-error">${esc(text(draft.error))}</p>` : ''}
    ${draft.status === 'draft' ? `<label class="p-backend-check"><input type="checkbox" data-backend-field="contactConfirmed"${state.contactConfirmed ? ' checked' : ''}> I reviewed the request and confirmed this supplier contact${simulated ? ' for this simulation' : ''}.</label>
    <button type="button" class="p-button p-button--brand" data-backend-action="send" data-draft="${esc(draft.id)}"${disabled(state.busy || !state.contactConfirmed || state.config?.email === 'disabled')}>${state.busy ? 'Working…' : simulated ? 'Simulate RFQ email' : 'Approve & send RFQ email'}</button>
    <p class="p-backend-muted">${simulated ? 'This records a simulated email in the outbox. No supplier is contacted.' : 'Sends this exact request to the displayed recipient. Provider acceptance does not confirm delivery.'}</p>` : ''}
  </section>`;
}

export function backendWorkspace(state = createBackendState()) {
  const live = state.config?.mode === 'live';
  const unavailable = state.loading || !state.config || live && !state.authenticated;
  return `<section class="p-backend p-card" id="p-backend-workspace" aria-label="Supplier sourcing and material indices">
    <header class="p-card__head"><h2>Supplier sourcing & market evidence</h2>${badge(state.config ? live ? 'Live connections' : 'Demo · no credentials needed' : 'Connecting to backend…')}<button type="button" class="p-button p-button--quiet" data-backend-action="reload"${disabled(state.busy)}>Reload</button></header>
    <div class="p-backend-body">
    <p class="p-backend-muted">${live ? 'Research suppliers, inspect their sources, and approve each RFQ before sending.' : 'Try the complete workflow with fictional suppliers and simulated email. Runs and drafts are saved by the local backend.'}</p>
    ${state.config ? `<div class="p-backend-connections"><span>Supplier research: <strong>${esc(state.config.discovery)}</strong></span><span>Email: <strong>${esc(state.config.email)}</strong></span><span>Indices: <strong>${esc(state.config.indexMode)}</strong></span></div>` : ''}
    ${live && !state.authenticated ? '<form data-backend-form="connect" class="p-backend-connect"><label>Local API access token<input type="password" name="token" autocomplete="off" required placeholder="PROCUS_API_TOKEN"></label><button class="p-button" type="submit">Connect</button><p class="p-backend-muted">Kept only in this page session. Provider credentials belong on the server.</p></form>' : ''}
    ${state.error ? `<p class="p-backend-error" role="alert">${esc(state.error)}</p>` : ''}
    ${state.notice ? `<p class="p-backend-notice" role="status">${esc(state.notice)}</p>` : ''}
    <form class="p-backend-form" data-backend-form="search">
      <label>Part to source<select data-backend-field="productId" name="productId">${products.map(product => `<option value="${esc(product.id)}"${state.productId === product.id ? ' selected' : ''}>${esc(product.id)} · ${esc(product.name)}</option>`).join('')}</select></label>
      <label>Annual volume (units)<input type="number" name="quantity" data-backend-field="quantity" min="1" step="1" value="${esc(state.quantity)}" placeholder="${live ? 'Enter a real requirement' : 'Use demo annual volume'}"${live ? ' required' : ''}></label>
      <label class="p-backend-spec">Specification & requirements<textarea name="specification" data-backend-field="specification" rows="2" maxlength="3000" placeholder="Material, process, revision, tolerances, certifications and delivery requirements"${live ? ' required' : ''}>${esc(state.specification)}</textarea></label>
      <div class="p-backend-line p-backend-spec"><button type="submit" class="p-button p-button--brand"${disabled(state.busy || unavailable || state.config?.discovery === 'unconfigured')}>${state.busy ? 'Working…' : live ? 'Find suppliers' : 'Find demo suppliers'}</button><span class="p-backend-muted">${live ? 'Review the real specification and quantity before starting. Portfolio parts are examples.' : 'Leave requirements blank to use the example part.'}</span></div>
    </form>
    <div data-backend-results>${results(state)}</div>
    ${draftPreview(state)}
    ${state.outbox.length ? `<details class="p-backend-outbox" data-backend-detail="outbox" open><summary>RFQ outbox · ${state.outbox.length}</summary><ul>${state.outbox.map(draft => `<li><span><strong>${esc(draft.to)}</strong><small>${esc(draft.subject)} · ${esc(emailStatus(draft.status))}</small></span><button type="button" class="p-button p-button--quiet" data-backend-action="preview" data-draft="${esc(draft.id)}">Review</button></li>`).join('')}</ul></details>` : ''}
    <section class="p-backend-indices" aria-labelledby="p-backend-indices-title">
      <div class="p-backend-line"><h3 id="p-backend-indices-title">Raw material index sources</h3><button type="button" class="p-button" data-backend-action="refresh-indices"${disabled(state.busy || unavailable)}>${state.config?.indexMode === 'live' ? 'Fetch latest indices' : 'Replay saved indices'}</button></div>
      <p class="p-backend-muted">Official series and their material coverage. A producer-price proxy is context, not a supplier quote or a direct raw-material spot price.</p>
      <form data-backend-form="indices" class="p-backend-index-search"><label>Find a material or source<input type="search" name="query" data-backend-field="query" value="${esc(state.query)}" placeholder="Steel, aluminium, copper…"></label><button type="submit" class="p-button"${disabled(state.busy || unavailable)}>Search indices</button></form>
      <div class="p-backend-index-list">${state.sources.length ? state.sources.map(source => `<details class="p-backend-index-row" data-backend-detail="index-${esc(source.id)}"><summary>
        <span class="p-backend-index-identity"><strong>${esc(source.label || source.name || source.id)}</strong><small>${esc(source.material)} · ${esc(source.geography)} · ${esc(source.frequency)}</small></span>
        <span class="p-backend-index-value"><strong>${Number.isFinite(source.latestValue) ? esc(source.latestValue) : '—'}</strong><small>${esc(source.unit || 'Index value')}</small></span>
        <span class="p-backend-index-status">${badge(source.status || (source.available === false ? 'Unavailable' : source.snapshotMode === 'bundled_demo' ? 'Bundled snapshot' : source.snapshotMode === 'saved_live' ? 'Fetched snapshot' : 'Saved source'))}<small>Latest period: <strong>${esc(source.latestPeriod || 'Unavailable')}</strong></small></span>
        </summary><div class="p-backend-index-detail"><p class="p-backend-muted">${esc(text(source.limitation || source.limitations))}</p><p>${link(source.sourceUrl || source.url, 'Official source ↗')} <span class="p-backend-muted">Retrieved ${esc(date(source.retrievedAt))}</span></p>${source.fallbackReason ? `<p class="p-backend-muted">${esc(source.fallbackReason)}</p>` : ''}${source.error ? `<p class="p-backend-error">${esc(text(source.error))}</p>` : ''}</div></details>`).join('') : `<p class="p-backend-empty">${state.loading ? 'Loading saved index sources…' : unavailable ? 'Connect to load index sources.' : 'No matching supported source. Try a broader material name.'}</p>`}</div>
    </section>
    </div></section>`;
}

export function attachBackendWorkspace({ root, ui, onIndicesUpdated = () => {}, fetchImpl = fetch }) {
  const state = ui.backend = createBackendState();
  let token = '';
  let pollTimer;
  let requestSequence = 0;
  let pendingSubmission = null;
  let pollingPaused = false;
  let deferredFocus = null;
  const paint = () => {
    const node = root.querySelector('#p-backend-workspace');
    if (!node) return;
    const focused = node.contains(document.activeElement) ? document.activeElement : null;
    const focus = focused ? captureBackendFocus(focused) : document.activeElement === document.body ? deferredFocus : null;
    const expanded = new Map([...node.querySelectorAll('[data-backend-detail]')].map(detail => [detail.dataset.backendDetail, detail.open]));
    node.outerHTML = backendWorkspace(state);
    root.querySelectorAll('#p-backend-workspace [data-backend-detail]').forEach(detail => { if (expanded.has(detail.dataset.backendDetail)) detail.open = expanded.get(detail.dataset.backendDetail); });
    deferredFocus = restoreBackendFocus(root.querySelector('#p-backend-workspace'), focus) ? null : focus;
  };
  const request = async (path, body) => {
    try { return await backendRequest(path, { body, token, fetchImpl }); }
    catch (error) {
      if (error.status === 401) state.authenticated = false;
      throw error;
    }
  };
  const schedulePoll = () => {
    clearTimeout(pollTimer);
    if (pollingPaused) return;
    if (state.runs.some(run => ['queued', 'running'].includes(run.status)) || state.outbox.some(draft => draft.status === 'sending')) pollTimer = setTimeout(async () => {
      if (state.busy) { schedulePoll(); return; }
      try { await loadWorkspace(); paint(); } catch (error) { state.error = error.message; paint(); }
    }, 3000);
  };
  const loadWorkspace = async () => {
    const sequence = ++requestSequence;
    let payload;
    try { payload = await request('workspace'); }
    catch (error) { pollingPaused = true; throw error; }
    if (sequence !== requestSequence) return;
    pollingPaused = false;
    state.runs = payload.runs || [];
    state.outbox = payload.outbox || [];
    if (pendingSubmission) {
      const submitted = state.outbox.find(draft => draft.id === pendingSubmission);
      if (submitted) { state.notice = emailStatus(submitted.status); if (submitted.status !== 'sending') pendingSubmission = null; }
    }
    state.authenticated = true;
    schedulePoll();
  };
  const loadIndices = async () => {
    const payload = await request(`indices?q=${encodeURIComponent(state.query)}`);
    state.sources = payload.sources || [];
  };
  const perform = async action => {
    if (state.busy) return;
    ++requestSequence;
    state.busy = true; state.error = ''; state.notice = ''; paint();
    try { await action(); } catch (error) { state.error = error.message; }
    finally { state.busy = false; state.loading = false; paint(); schedulePoll(); }
  };
  const reload = async () => {
    state.config = await request('config');
    if (state.config.mode === 'live' && !token) return;
    await loadWorkspace();
    await loadIndices();
  };
  root.addEventListener('input', event => {
    const field = event.target.dataset.backendField;
    if (field === 'productId') selectBackendPart(state, event.target.value);
    else if (field && field !== 'contactConfirmed') state[field] = event.target.value;
  });
  root.addEventListener('change', event => {
    const field = event.target.dataset.backendField;
    if (field === 'productId') {
      selectBackendPart(state, event.target.value);
      paint();
    } else if (field && field !== 'contactConfirmed') state[field] = event.target.value;
    if (field === 'contactConfirmed') {
      state.contactConfirmed = event.target.checked;
      const button = root.querySelector('[data-backend-action="send"]');
      if (button) button.disabled = state.busy || !state.contactConfirmed || state.config?.email === 'disabled';
    }
  });
  root.addEventListener('submit', event => {
    const form = event.target.closest('[data-backend-form]');
    if (!form) return;
    event.preventDefault();
    const values = new FormData(form);
    if (form.dataset.backendForm === 'connect') token = String(values.get('token') || '');
    perform(async () => {
      if (form.dataset.backendForm === 'connect') { await loadWorkspace(); await loadIndices(); return; }
      if (form.dataset.backendForm === 'indices') { await loadIndices(); return; }
      const run = await request('runs', { productId: state.productId, ...(state.specification.trim() ? { specification: state.specification.trim() } : {}), ...(state.quantity ? { quantity: Number(state.quantity) } : {}) });
      state.runs.unshift(run);
      state.notice = 'Supplier research started. Each candidate and contact needs review before an RFQ is sent.';
      await loadWorkspace();
    });
  });
  root.addEventListener('click', event => {
    const button = event.target.closest('[data-backend-action]');
    if (!button || button.disabled) return;
    const action = button.dataset.backendAction;
    if (action === 'preview' || action === 'close-preview') {
      state.selectedDraft = action === 'preview' ? button.dataset.draft : null; state.contactConfirmed = false; paint();
      root.querySelector('.p-backend-preview')?.focus({ preventScroll: false }); return;
    }
    perform(async () => {
      if (action === 'reload') await reload();
      if (action === 'draft') {
        const draft = await request('drafts', { runId: button.dataset.run, candidateId: button.dataset.candidate });
        state.outbox = [draft, ...state.outbox.filter(item => item.id !== draft.id)]; state.selectedDraft = draft.id; state.contactConfirmed = false;
      }
      if (action === 'send') {
        if (!state.contactConfirmed) return;
        const email = await request(`drafts/${encodeURIComponent(button.dataset.draft)}/send`, { approved: true, contactConfirmed: true });
        pendingSubmission = button.dataset.draft;
        state.notice = emailStatus(email.status); state.contactConfirmed = false;
        await loadWorkspace();
      }
      if (action === 'refresh-indices') {
        await request('indices/refresh', {}); await loadIndices(); await onIndicesUpdated();
        state.notice = state.config.indexMode !== 'live' ? 'Saved index evidence replayed. Portfolio analysis updated.' : 'Index refresh finished. Review source status and observation periods below.';
      }
    }).then(() => { if (action === 'draft') root.querySelector('.p-backend-preview')?.focus(); });
  });
  perform(reload);
  return { reload: () => perform(reload), destroy: () => clearTimeout(pollTimer) };
}
