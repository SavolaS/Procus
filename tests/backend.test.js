import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { createStore } from '../backend/store.mjs';
import { createWorkspace } from '../backend/workspace.mjs';
import { readConfig, publicConfig } from '../backend/config.mjs';
import { createBackendHandler } from '../backend/http.mjs';
import { products } from '../src/data.js';

const lead = { name: 'Example manufacturer', country: 'Finland', website: 'https://manufacturer.test',
  capability: 'Published machining capability', email: 'sales@manufacturer.test', contactSource: 'https://manufacturer.test/contact',
  sources: ['https://manufacturer.test/machining'], uncertainty: 'Capacity and specification unverified' };
const requirements = { productId: 'TM-105', specification: 'Drawing 100 revision A, aluminium casting, confirm tolerances', quantity: 500 };
const live = { PROCUS_MODE: 'live', PROCUS_INDEX_MODE: 'snapshot', PROCUS_API_TOKEN: 'test-token-at-least-24-characters',
  OPENAI_API_KEY: 'openai-secret-sentinel', RESEND_API_KEY: 'resend-secret-sentinel', PROCUS_EMAIL_FROM: 'rfq@buyer.test', PROCUS_EMAIL_ENABLED: 'true' };

async function fixture(t, env = {}, overrides = {}) {
  const directory = await mkdtemp(join(tmpdir(), 'procus-backend-'));
  const store = await createStore(directory);
  const config = readConfig({ ...env, PROCUS_DATA_DIR: directory });
  const workspace = createWorkspace({ config, store, products, ...overrides });
  t.after(async () => { await workspace.idle(); await store.close(); await rm(directory, { recursive: true, force: true }); });
  return { directory, store, config, workspace };
}
async function draftFor(workspace) {
  const run = await workspace.createRun(requirements);
  await workspace.idle();
  const ready = workspace.snapshot().runs.find(item => item.id === run.id);
  return workspace.createDraft({ runId: run.id, candidateId: ready.candidates[0].id });
}
const researchAgent = async options => {
  await options.onEvent({ type: 'agent.session.created', sessionId: 'sess_test' });
  await options.handleTool('record_candidates', { candidates: [lead] });
};

test('default configuration never activates credentials or external email and rejects unsafe live config', () => {
  const demo = readConfig({ OPENAI_API_KEY: 'secret', RESEND_API_KEY: 'secret', PROCUS_EMAIL_ENABLED: 'true' });
  assert.equal(demo.mode, 'demo'); assert.equal(demo.emailEnabled, false); assert.equal(demo.indexMode, 'snapshot');
  assert.deepEqual(publicConfig(demo), { mode: 'demo', discovery: 'demo', email: 'simulated', indexMode: 'snapshot' });
  assert.throws(() => readConfig({ PROCUS_MODE: 'prod' }));
  assert.throws(() => readConfig({ PROCUS_MODE: 'live' }), /TOKEN/);
  assert.throws(() => readConfig({ ...live, RESEND_API_KEY: '' }), /RESEND/);
  assert.throws(() => readConfig({ PROCUS_INDEX_REFRESH_HOURS: 'NaN' }));
});

test('credential-free workflow persists candidates, one draft and one simulated send across restart', async t => {
  const { workspace, store, directory } = await fixture(t, {}, {
    agent: () => { throw new Error('Demo called live agent'); }, deliver: () => { throw new Error('Demo called email provider'); },
  });
  const draft = await draftFor(workspace);
  assert.equal(draft.mode, 'demo'); assert.equal(draft.status, 'draft');
  assert.match(draft.body, /500 units/); assert.doesNotMatch(draft.body, /LAA|least acceptable|21\.06|Alex Kim/);
  const run = workspace.snapshot().runs[0];
  assert.equal((await workspace.createDraft({ runId: run.id, candidateId: run.candidates[0].id })).id, draft.id);
  await assert.rejects(workspace.sendDraft(draft.id, { approved: true }), /confirm/);
  await Promise.all([workspace.sendDraft(draft.id, { approved: true, contactConfirmed: true }), workspace.sendDraft(draft.id, { approved: true, contactConfirmed: true })]);
  await workspace.idle();
  assert.equal(workspace.snapshot().outbox.length, 1);
  assert.equal(workspace.snapshot().outbox[0].status, 'simulated');
  await store.close();
  const reopened = await createStore(directory);
  assert.equal(reopened.read().outbox[0].status, 'simulated');
  assert.equal(reopened.read().runs[0].candidates.length, 2);
  await reopened.close();
});

test('live research receives only approved public requirement fields and rejects invalid sourced leads', async t => {
  let sent;
  const { workspace } = await fixture(t, live, { agent: async options => { sent = options; await researchAgent(options); } });
  await workspace.createRun({ requirement: { id: 'REAL-100', name: 'Housing', category: 'Castings', qty: 100,
    specification: 'Drawing revision A', internalLAA: 'PRIVATE_SENTINEL', target: 0.001, strategy: 'PRIVATE_SENTINEL' } });
  await workspace.idle();
  assert.doesNotMatch(sent.input, /PRIVATE_SENTINEL|target|internalLAA|strategy/);
  assert.equal(sent.tools[0].type, 'web_search');
  assert.equal(workspace.snapshot().runs[0].sessionId, 'sess_test');
  assert.equal(workspace.snapshot().runs[0].candidates[0].qualification, 'unverified');
  const invalid = await fixture(t, live, { agent: async options => options.handleTool('record_candidates', { candidates: [{ ...lead, sources: [] }] }) });
  await invalid.workspace.createRun(requirements); await invalid.workspace.idle();
  assert.equal(invalid.workspace.snapshot().runs[0].status, 'failed');
  assert.deepEqual(invalid.workspace.snapshot().runs[0].candidates, []);
  await assert.rejects(workspace.createRun({ productId: 'TM-105' }), /specification/);
});

test('live dispatch only invokes the immutable approved draft and preserves provider acceptance after agent failure', async t => {
  let deliveries = 0;
  let dispatched;
  const { workspace } = await fixture(t, live, {
    agent: async options => {
      if (options.tools[0].type === 'web_search') return researchAgent(options);
      const id = JSON.parse(options.input).draftId;
      await assert.rejects(options.handleTool('send_approved_rfq', { draftId: 'other-id' }), /Unapproved/);
      await options.handleTool('send_approved_rfq', { draftId: id });
      await options.handleTool('send_approved_rfq', { draftId: id });
      throw new Error('Stream dropped after accepted transmission');
    },
    deliver: async ({ draft }) => { deliveries++; dispatched = draft; return { status: 'accepted', providerId: 'email_123' }; },
  });
  const draft = await draftFor(workspace);
  await Promise.all([workspace.sendDraft(draft.id, { approved: true, contactConfirmed: true, to: 'attacker@test.example', body: 'changed' }),
    workspace.sendDraft(draft.id, { approved: true, contactConfirmed: true })]);
  await workspace.idle();
  assert.equal(deliveries, 1); assert.equal(dispatched.to, lead.email); assert.equal(dispatched.body, draft.body);
  const sent = workspace.snapshot().outbox[0];
  assert.equal(sent.status, 'accepted'); assert.equal(sent.providerId, 'email_123'); assert.ok(sent.approvedAt);
  await workspace.sendDraft(draft.id, { approved: true, contactConfirmed: true }); await workspace.idle();
  assert.equal(deliveries, 1);
});

test('ambiguous and rejected transmissions are distinct and never retried automatically', async t => {
  for (const deliveryUnknown of [true, false]) {
    let attempts = 0;
    const { workspace } = await fixture(t, live, {
      agent: async options => options.tools[0].type === 'web_search' ? researchAgent(options)
        : options.handleTool('send_approved_rfq', JSON.parse(options.input)),
      deliver: async () => { attempts++; throw Object.assign(new Error('provider failed'), { deliveryUnknown }); },
    });
    const draft = await draftFor(workspace);
    await workspace.sendDraft(draft.id, { approved: true, contactConfirmed: true }); await workspace.idle();
    assert.equal(workspace.snapshot().outbox[0].status, deliveryUnknown ? 'unknown' : 'failed');
    await assert.rejects(workspace.sendDraft(draft.id, { approved: true, contactConfirmed: true }), /cannot be retried/);
    assert.equal(attempts, 1);
  }
});

test('switching a custom data directory to demo does not expose or reuse live records', async t => {
  const { workspace: liveWorkspace, store, config } = await fixture(t, live, { agent: researchAgent });
  const liveDraft = await draftFor(liveWorkspace);
  const demoWorkspace = createWorkspace({ config: { ...config, mode: 'demo', emailEnabled: false }, store, products,
    agent: () => assert.fail('Demo must not call an agent'), deliver: () => assert.fail('Demo must not send email') });
  assert.deepEqual(demoWorkspace.snapshot(), { runs: [], outbox: [] });
  await assert.rejects(demoWorkspace.sendDraft(liveDraft.id, { approved: true, contactConfirmed: true }), /another mode/);
  const liveRun = liveWorkspace.snapshot().runs[0];
  await store.update(state => { state.runs[0].status = 'running'; });
  const demoRun = await demoWorkspace.createRun(requirements);
  await demoWorkspace.idle();
  assert.notEqual(demoRun.id, liveRun.id);
  assert.equal(demoRun.mode, 'demo');
  assert.equal(demoWorkspace.snapshot().runs.length, 1);
  assert.ok(liveWorkspace.snapshot().runs.every(run => run.mode === 'live'));
});

test('cancelled agent tool cannot start a later email transmission', async t => {
  let deliveries = 0;
  const { workspace } = await fixture(t, live, {
    agent: async options => {
      if (options.tools[0].type === 'web_search') return researchAgent(options);
      const controller = new AbortController();
      controller.abort();
      return options.handleTool('send_approved_rfq', JSON.parse(options.input), { signal: controller.signal });
    },
    deliver: async () => { deliveries++; return { status: 'accepted', providerId: 'unexpected' }; },
  });
  const draft = await draftFor(workspace);
  await workspace.sendDraft(draft.id, { approved: true, contactConfirmed: true });
  await workspace.idle();
  assert.equal(deliveries, 0);
  assert.equal(workspace.snapshot().outbox[0].status, 'failed');
});

test('store serializes writes, locks a directory, and recovers interrupted work conservatively', async t => {
  const { store, directory } = await fixture(t);
  await assert.rejects(createStore(directory), /locked/);
  await Promise.all(Array.from({ length: 20 }, (_, index) => store.update(state => { state.runs.push({ id: String(index), status: 'running' }); })));
  await store.update(state => { state.outbox.push({ id: 'unfinished', status: 'sending' }); });
  assert.equal(JSON.parse(await readFile(join(directory, 'workspace.json'), 'utf8')).runs.length, 20);
  await store.close();
  const reopened = await createStore(directory);
  assert.ok(reopened.read().runs.every(run => run.status === 'interrupted'));
  assert.equal(reopened.read().outbox[0].status, 'unknown');
  await reopened.close();
});

test('closed store rejects late writes and repeated close cannot release a new owner lock', async t => {
  const { store, directory } = await fixture(t);
  await store.close();
  await assert.rejects(async () => store.update(state => { state.runs.push({ id: 'late-write' }); }), /closed/i);
  const reopened = await createStore(directory);
  try {
    await store.close();
    await assert.rejects(createStore(directory), /locked/);
    assert.equal(reopened.read().runs.length, 0);
  } finally { await reopened.close(); }
});

test('HTTP routes enforce authentication, same-origin JSON, limits, and truthful asynchronous workflow', async t => {
  const { config, workspace } = await fixture(t, live, { agent: researchAgent });
  const handler = createBackendHandler({ config, workspace, indices: { list: async () => ({ sources: [] }) }, pricingService: {}, securityHeaders: { 'Cache-Control': 'no-store' } });
  const server = createServer(async (request, response) => {
    if (!await handler(request, response, new URL(request.url, 'http://localhost'))) { response.writeHead(404); response.end(); }
  });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}/api/backend/`;
  const auth = { Authorization: `Bearer ${config.apiToken}` };
  const post = body => ({ method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const publicResponse = await fetch(base + 'config');
  assert.equal(publicResponse.status, 200); assert.doesNotMatch(await publicResponse.text(), /secret-sentinel|test-token/);
  assert.equal((await fetch(base + 'workspace')).status, 401);
  assert.equal((await fetch(base + 'workspace', { headers: auth })).status, 200);
  assert.equal((await fetch(base + 'runs', { ...post(requirements), headers: { ...post({}).headers, Origin: 'https://malicious.example' } })).status, 403);
  assert.equal((await fetch(base + 'runs', { method: 'POST', headers: auth, body: '{}' })).status, 415);
  assert.equal((await fetch(base + 'runs', { ...post({}), body: '{broken' })).status, 400);
  assert.equal((await fetch(base + 'runs', post({ specification: 'a'.repeat(33000) }))).status, 413);
  assert.equal((await fetch(base + 'workspace', post({}))).status, 405);
  assert.equal((await fetch(base + 'missing', { headers: auth })).status, 404);
  const started = await fetch(base + 'runs', post(requirements));
  assert.equal(started.status, 202);
  await workspace.idle();
  const snapshot = await (await fetch(base + 'workspace', { headers: auth })).json();
  assert.equal(snapshot.runs[0].status, 'completed');
});
