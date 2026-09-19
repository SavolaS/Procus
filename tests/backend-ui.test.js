import test from 'node:test';
import assert from 'node:assert/strict';
import { backendWorkspace, backendRequest, createBackendState, emailStatus, selectBackendPart, captureBackendFocus, restoreBackendFocus } from '../src/backend-workspace.js';

const example = () => ({ ...createBackendState(), loading: false, config: { mode: 'demo', discovery: 'demo', email: 'simulated', indexMode: 'snapshot' }, runs: [{ id: 'run-1', productId: 'TM-105', mode: 'demo', status: 'completed', candidates: [{ id: 'candidate-1', name: 'Example supplier', email: 'rfq@example.invalid', capability: 'Castings', website: 'javascript:alert(1)', sources: [{ title: '<script>bad</script>', url: 'https://example.invalid/sources' }] }] }] });

test('demo backend sourcing needs no credentials and identifies the simulation', () => {
  const html = backendWorkspace(example());
  assert.match(html, /Find demo suppliers/);
  assert.match(html, /Demo supplier/);
  assert.match(html, /saved by the local backend/);
  assert.doesNotMatch(html, /name="token"/);
});

test('external evidence is escaped and unsafe link schemes are omitted', () => {
  const html = backendWorkspace(example());
  assert.doesNotMatch(html, /javascript:|<script>/);
  assert.match(html, /&lt;script&gt;bad/);
  assert.match(html, /rel="noopener noreferrer"/);
});

test('RFQ preview exposes the complete draft and requires an explicit contact check', () => {
  const state = example();
  state.outbox = [{ id: 'draft-1', runId: 'run-1', candidateId: 'candidate-1', to: 'rfq@example.invalid', subject: 'RFQ example', body: 'The complete request\nPlease provide delivery terms.', status: 'draft' }];
  state.selectedDraft = 'draft-1';
  const html = backendWorkspace(state);
  assert.match(html, /The complete request\nPlease provide delivery terms/);
  assert.match(html, /data-backend-action="send"[^>]* disabled/);
  assert.match(html, /Simulate RFQ email/);
  state.contactConfirmed = true;
  assert.doesNotMatch(backendWorkspace(state), /data-backend-action="send"[^>]* disabled/);
});

test('live access requires session token, reviewed specification and quantity', () => {
  const state = example();
  state.config = { mode: 'live', discovery: 'openai', email: 'resend', indexMode: 'live' };
  const html = backendWorkspace(state);
  assert.match(html, /type="password" name="token"/);
  assert.match(html, /name="specification"[^>]* required/);
  assert.match(html, /name="quantity"[^>]* required/);
  assert.match(html, /disabled>Find suppliers/);
});

test('outbox states never misrepresent provider acceptance or uncertain submission as delivery', () => {
  assert.match(emailStatus('accepted'), /delivery unconfirmed/);
  assert.match(emailStatus('unknown'), /check provider before retrying/);
  const state = example();
  state.selectedDraft = 'draft-1';
  state.outbox = [{ id: 'draft-1', status: 'unknown', to: 'rfq@example.invalid', subject: 'RFQ', body: 'Request' }];
  assert.doesNotMatch(backendWorkspace(state), /data-backend-action="send"/);
});

test('unsupported index sources are visible without fabricated observation periods', () => {
  const state = example();
  state.sources = [{ id: 'aluminium', label: 'Aluminium PPI', material: 'aluminium', available: false, limitation: 'Producer-price proxy only' }];
  const html = backendWorkspace(state);
  assert.match(html, /Unavailable/);
  assert.match(html, /Latest period: <strong>Unavailable/);
  assert.match(html, /Producer-price proxy only/);
});

test('timed-out backend requests release the UI and require checking saved state', async () => {
  const fetchImpl = (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
  });
  await assert.rejects(backendRequest('workspace', { fetchImpl, timeoutMs: 5 }), /timed out.*Reload to check the saved status/);
});

test('backend authentication failures preserve their status for reconnect UI', async () => {
  const fetchImpl = async () => ({ ok: false, status: 401, json: async () => ({ error: 'Invalid token' }) });
  await assert.rejects(backendRequest('workspace', { fetchImpl }), error => error.status === 401 && error.message === 'Invalid token');
});

test('switching parts clears drawing and volume, while repeated selection preserves current edits', () => {
  const state = { ...example(), specification: 'Drawing TM-105 revision C', quantity: '26000' };
  selectBackendPart(state, 'TM-105');
  assert.equal(state.specification, 'Drawing TM-105 revision C');
  assert.equal(state.quantity, '26000');
  selectBackendPart(state, 'NF-101');
  assert.equal(state.productId, 'NF-101');
  assert.equal(state.specification, '');
  assert.equal(state.quantity, '');
  assert.equal(state.runs.length, 1, 'Existing research remains available');
});

function control({ dataset = {}, localName = 'button', detail, ...properties } = {}) {
  return { dataset, localName, ...properties,
    closest: selector => selector === '[data-backend-detail]' && detail ? { dataset: { backendDetail: detail } } : null,
    focus() { this.focused = true; },
    setSelectionRange(...selection) { this.restoredSelection = selection; },
  };
}

test('poll repaint restores the same action and disclosure even if result order changes', () => {
  const current = control({ dataset: { backendAction: 'preview', draft: 'draft-two' } });
  const other = control({ dataset: { backendAction: 'preview', draft: 'draft-one' } });
  const replacement = control({ dataset: { ...current.dataset } });
  const container = { querySelectorAll: () => [other, replacement] };
  assert.equal(restoreBackendFocus(container, captureBackendFocus(current)), true);
  assert.equal(replacement.focused, true);
  assert.equal(other.focused, undefined);

  const summary = control({ localName: 'summary', detail: 'index-steel' });
  const replacementSummary = control({ localName: 'summary', detail: 'index-steel' });
  assert.equal(restoreBackendFocus({ querySelectorAll: () => [control({ localName: 'summary', detail: 'index-copper' }), replacementSummary] }, captureBackendFocus(summary)), true);
  assert.equal(replacementSummary.focused, true);
});

test('poll repaint preserves a selected specification range, its direction and scroll', () => {
  const current = control({ localName: 'textarea', dataset: { backendField: 'specification' }, selectionStart: 12, selectionEnd: 35, selectionDirection: 'backward', scrollTop: 100 });
  const replacement = control({ localName: 'textarea', dataset: { backendField: 'specification' } });
  restoreBackendFocus({ querySelectorAll: () => [replacement] }, captureBackendFocus(current));
  assert.deepEqual(replacement.restoredSelection, [12, 35, 'backward']);
  assert.equal(replacement.scrollTop, 100);
});
