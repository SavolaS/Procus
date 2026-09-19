const API = 'https://api.openai.com/v1/agents/sessions';
const MAX_FRAME = 1024 * 1024;
const MAX_STREAM = 8 * MAX_FRAME;

function failure(message, code = 'agent_failed') {
  return Object.assign(new Error(message), { code, status: 502 });
}

// SSE boundaries and UTF-8 characters can both straddle network chunks.
async function* events(body) {
  if (!body?.getReader) throw failure('The agent provider did not return an event stream.');
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let pending = '', frame = [], frameSize = 0, total = 0;
  function parse() {
    const data = frame.join('\n');
    frame = []; frameSize = 0;
    if (!data || data === '[DONE]') return null;
    try { return JSON.parse(data); } catch { throw failure('The agent provider returned an invalid event.'); }
  }
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (value) total += value.byteLength;
      if (total > MAX_STREAM) throw failure('The agent event stream exceeded its size limit.');
      pending += decoder.decode(value, { stream: !done });
      let newline;
      while ((newline = pending.indexOf('\n')) !== -1) {
        const line = pending.slice(0, newline).replace(/\r$/, '');
        pending = pending.slice(newline + 1);
        if (!line) {
          const event = parse();
          if (event) yield event;
        } else if (line.startsWith('data:')) {
          const data = line.slice(5).replace(/^ /, '');
          frameSize += data.length;
          if (frameSize > MAX_FRAME) throw failure('The agent event exceeded its size limit.');
          frame.push(data);
        }
      }
      if (pending.length > MAX_FRAME) throw failure('The agent event exceeded its size limit.');
      if (done) break;
    }
    // A frame without the terminating blank line is incomplete and never executed.
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

/** Run one root turn using the hosted Agents API, with application-owned tools. */
export async function runAgent({ apiKey, model, instructions, input, tools = [], handleTool,
  onEvent = () => {}, fetchImpl = fetch, timeoutMs = 180000 }) {
  if (!apiKey) throw failure('Configure OPENAI_API_KEY to run a live agent.', 'agent_unconfigured');
  const controller = new AbortController();
  let sessionId = null;
  const headers = { Authorization: `Bearer ${apiKey}`, 'OpenAI-Beta': 'agents=v1', 'Content-Type': 'application/json' };
  const allowedTools = new Set(tools.filter(tool => tool.type === 'function').map(tool => tool.name));
  const calls = new Map();
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(failure('The agent timed out. Review the run before trying again.', 'agent_timeout'));
    }, timeoutMs);
  });
  async function post(url, body) {
    const response = await fetchImpl(url, { method: 'POST', headers, body: JSON.stringify(body), signal: controller.signal, redirect: 'error' });
    if (!response.ok) {
      await response.body?.cancel().catch(() => {});
      throw failure(`The agent provider rejected the request (HTTP ${response.status}).`);
    }
    return response;
  }
  async function run() {
    const response = await post(API, { agent: { model, instructions, tools }, environment: { type: 'none' }, input, stream: true });
    for await (const event of events(response.body)) {
      if (controller.signal.aborted) throw failure('The agent timed out.', 'agent_timeout');
      const id = event.session?.id || event.session_id;
      if (id) {
        if (typeof id !== 'string' || !/^[A-Za-z0-9_-]{1,200}$/.test(id) || (sessionId && id !== sessionId)) throw failure('The agent provider returned an invalid session.');
        sessionId = id;
      }
      if (typeof event.type !== 'string') throw failure('The agent provider returned an invalid event.');
      await onEvent({ type: event.type, sessionId });
      if (['error', 'agent.session.failed', 'agent.session.environment.failed'].includes(event.type)
        || (['agent.session.turn.failed', 'agent.session.turn.cancelled'].includes(event.type) && event.turn?.subagent_id == null)) {
        throw failure('The agent provider could not complete this run.');
      }
      if (event.type === 'agent.session.turn.completed' && event.turn?.subagent_id === null) {
        if (!sessionId) throw failure('The agent provider omitted the session identifier.');
        return { sessionId };
      }
      if (event.type !== 'agent.session.requires_action') continue;
      if (!sessionId || !Array.isArray(event.session?.required_actions)) throw failure('The agent provider returned an invalid tool request.');
      for (const action of event.session.required_actions) {
        if (controller.signal.aborted) throw failure('The agent timed out.', 'agent_timeout');
        if (action.type !== 'function_call' || !allowedTools.has(action.name) || typeof handleTool !== 'function'
          || typeof action.turn_id !== 'string' || typeof action.call_id !== 'string'
          || !action.arguments || typeof action.arguments !== 'object' || Array.isArray(action.arguments)) {
          throw failure('The agent requested an unsupported tool operation.');
        }
        const key = `${action.turn_id}:${action.call_id}`;
        const fingerprint = JSON.stringify([action.name, action.arguments]);
        let call = calls.get(key);
        if (call && call.fingerprint !== fingerprint) throw failure('The agent changed a previously requested tool operation.');
        if (!call) {
          if (calls.size >= 20) throw failure('The agent exceeded its tool call limit.');
          call = { fingerprint, result: null };
          calls.set(key, call);
          await onEvent({ type: 'tool.started', sessionId, toolName: action.name });
          // Tool exceptions abort this run. The same side effect is never retried here.
          const output = await handleTool(action.name, action.arguments, { sessionId, turnId: action.turn_id, callId: action.call_id, signal: controller.signal });
          call.result = { type: 'agent.session.input.tool_result', turn_id: action.turn_id, call_id: action.call_id, success: true, output: JSON.stringify(output ?? null) };
        }
        if (controller.signal.aborted) throw failure('The agent timed out.', 'agent_timeout');
        const result = await post(`${API}/${encodeURIComponent(sessionId)}/events`, { events: [call.result] });
        await result.body?.cancel().catch(() => {});
      }
    }
    throw failure('The agent stream ended before the main turn completed.');
  }
  try {
    return await Promise.race([run(), timeout]);
  } catch (error) {
    // Never return provider bodies, raw fetch errors, or tool error details to a browser.
    const safe = typeof error?.code === 'string' && error.code.startsWith('agent_') ? error : failure('The agent run could not be completed.');
    if (typeof error?.deliveryUnknown === 'boolean') safe.deliveryUnknown = error.deliveryUnknown;
    safe.sessionId = sessionId;
    throw safe;
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
}
