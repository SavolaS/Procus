import test from 'node:test';
import assert from 'node:assert/strict';
import { runAgent } from '../backend/agents.mjs';
import { sendEmail } from '../backend/email.mjs';

const session = { type: 'agent.session.created', session: { id: 'sess_test' } };
const completed = { type: 'agent.session.turn.completed', turn: { subagent_id: null } };
const action = { type: 'function_call', turn_id: 'turn_1', call_id: 'call_1', name: 'record_candidates', arguments: { name: 'Mäkelä' } };
const required = (calls = [action]) => ({ type: 'agent.session.requires_action', session: { id: 'sess_test', required_actions: calls } });
function stream(items, chunkSize = 17) {
  const data = new TextEncoder().encode(items.map(item => `: heartbeat\r\nevent: ${item.type}\r\ndata: ${JSON.stringify(item)}\r\n\r\n`).join(''));
  let offset = 0;
  return new Response(new ReadableStream({ pull(controller) {
    if (offset >= data.length) return controller.close();
    controller.enqueue(data.slice(offset, offset += chunkSize));
  } }), { headers: { 'Content-Type': 'text/event-stream' } });
}
const opts = { apiKey: 'test-secret', model: 'test-model', instructions: 'Find suppliers', input: 'Metal housings',
  tools: [{ type: 'web_search', mode: 'live' }, { type: 'function', name: 'record_candidates', parameters: { type: 'object' } }] };

test('Agents API streams fragmented UTF-8, handles pending tools once, and returns root completion', async () => {
  const requests = [], updates = [];
  let effects = 0;
  const result = await runAgent({ ...opts, onEvent: event => updates.push(event),
    handleTool: (name, args, context) => { effects++; assert.equal(name, action.name); assert.equal(args.name, 'Mäkelä'); assert.equal(context.sessionId, 'sess_test'); return { count: 1 }; },
    fetchImpl: async (url, options) => {
      requests.push({ url, ...options });
      return requests.length === 1 ? stream([session, required(), required(), { type: 'agent.session.idle' }, completed], 1) : Response.json({});
    },
  });
  assert.deepEqual(result, { sessionId: 'sess_test' });
  assert.equal(effects, 1);
  assert.equal(requests[0].url, 'https://api.openai.com/v1/agents/sessions');
  assert.equal(requests[0].headers['OpenAI-Beta'], 'agents=v1');
  assert.deepEqual(JSON.parse(requests[0].body), { agent: { model: opts.model, instructions: opts.instructions, tools: opts.tools }, environment: { type: 'none' }, input: opts.input, stream: true });
  assert.equal(requests[1].url, 'https://api.openai.com/v1/agents/sessions/sess_test/events');
  assert.deepEqual(JSON.parse(requests[1].body).events[0], { type: 'agent.session.input.tool_result', turn_id: 'turn_1', call_id: 'call_1', success: true, output: '{"count":1}' });
  assert(updates.some(update => update.type === 'tool.started'));
  assert(!JSON.stringify(updates).includes('Mäkelä'));
});

test('idle, subagent completion, truncated streams and upstream errors never claim success', async () => {
  for (const items of [
    [session, { type: 'agent.session.idle' }],
    [session, { ...completed, turn: { subagent_id: 'subagent_1' } }],
    [session, { type: 'agent.session.turn.failed', turn: { subagent_id: null, error: { message: 'secret contents' } } }],
    [session, { type: 'error', error: { message: 'secret contents' } }],
  ]) {
    await assert.rejects(runAgent({ ...opts, fetchImpl: async () => stream(items) }), error => error.code === 'agent_failed' && !error.message.includes('secret'));
  }
  await assert.rejects(runAgent({ ...opts, fetchImpl: async () => new Response('data: {"type":"agent.session.turn.completed","turn":{"subagent_id":null}}') }), /stream ended/);
});

test('unsupported or changed calls cannot execute effects', async () => {
  let effects = 0;
  await assert.rejects(runAgent({ ...opts, handleTool: () => { effects++; }, fetchImpl: async () => stream([session, required([{ ...action, name: 'send_email' }])]) }), /unsupported tool/);
  assert.equal(effects, 0);
  let requests = 0;
  await assert.rejects(runAgent({ ...opts, handleTool: () => { effects++; }, fetchImpl: async () => ++requests === 1
    ? stream([session, required(), required([{ ...action, arguments: { name: 'Changed' } }])]) : Response.json({}) }), /changed a previously/);
  assert.equal(effects, 1);
});

test('provider failures are sanitized and timeout bounds a stuck request', async () => {
  await assert.rejects(runAgent({ ...opts, fetchImpl: async () => new Response('secret provider body', { status: 401 }) }), /HTTP 401/);
  await assert.rejects(runAgent({ ...opts, fetchImpl: async () => { throw new Error('secret token'); } }), error => !error.message.includes('secret'));
  await assert.rejects(runAgent({ ...opts, timeoutMs: 10, fetchImpl: async () => new Promise(() => {}) }), error => error.code === 'agent_timeout');
});

test('failed tool effects are never acknowledged as success or retried', async () => {
  let requests = 0, effects = 0;
  await assert.rejects(runAgent({ ...opts,
    fetchImpl: async () => { requests++; return stream([session, required(), required(), completed]); },
    handleTool: () => { effects++; throw Object.assign(new Error('private provider detail'), { deliveryUnknown: true, code: 42 }); },
  }), error => error.deliveryUnknown && !error.message.includes('private'));
  assert.equal(effects, 1);
  assert.equal(requests, 1);
});

test('definite provider rejection remains definite after passing through agent tool handling', async () => {
  await assert.rejects(runAgent({ ...opts,
    fetchImpl: async () => stream([session, required(), completed]),
    handleTool: () => { throw Object.assign(new Error('private rejection'), { deliveryUnknown: false }); },
  }), error => error.deliveryUnknown === false && !error.message.includes('private'));
});

test('oversized SSE data is rejected before parsing or executing a tool', async () => {
  await assert.rejects(runAgent({ ...opts,
    fetchImpl: async () => new Response(`data: ${'x'.repeat(1024 * 1024 + 1)}`),
    handleTool: () => assert.fail('Must not execute tool'),
  }), /size limit/);
});

const config = { mode: 'live', emailEnabled: true, emailKey: 'test-secret', emailFrom: 'Procus <buyer@example.com>' };
const draft = { id: 'draft_1', to: 'sales@example.com', subject: 'RFQ', body: 'Please quote this specification.' };

test('Resend sends the immutable text and stable idempotency key, recording acceptance only', async () => {
  const result = await sendEmail({ config, draft, fetchImpl: async (url, options) => {
    assert.equal(url, 'https://api.resend.com/emails');
    assert.equal(options.headers['Idempotency-Key'], 'procus-rfq-draft_1');
    assert.deepEqual(JSON.parse(options.body), { from: config.emailFrom, to: [draft.to], subject: draft.subject, text: draft.body });
    return Response.json({ id: 'provider_1' });
  } });
  assert.deepEqual(result, { providerId: 'provider_1', status: 'accepted' });
});

test('Resend cannot send in demo or disabled mode', async () => {
  for (const override of [{ mode: 'demo' }, { emailEnabled: false }, { emailKey: '' }]) {
    await assert.rejects(sendEmail({ config: { ...config, ...override }, draft, fetchImpl: () => assert.fail('Must not access network') }), error => !error.deliveryUnknown);
  }
});

test('Resend preserves unknown transmission status and strips provider errors', async () => {
  for (const [status, unknown] of [[400, false], [401, false], [429, true], [500, true]]) {
    await assert.rejects(sendEmail({ config, draft, fetchImpl: async () => new Response('secret provider body', { status }) }), error => error.deliveryUnknown === unknown && !error.message.includes('secret'));
  }
  await assert.rejects(sendEmail({ config, draft, fetchImpl: async () => Response.json({}) }), error => error.deliveryUnknown);
  await assert.rejects(sendEmail({ config, draft, fetchImpl: async () => { throw new Error('secret token'); } }), error => error.deliveryUnknown && !error.message.includes('secret'));
  await assert.rejects(sendEmail({ config, draft, timeoutMs: 10, fetchImpl: async () => new Promise(() => {}) }), error => error.deliveryUnknown);
});
