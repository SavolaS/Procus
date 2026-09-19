/** Sends only a stored, approved draft. The workflow owns approval and immutability. */
export async function sendEmail({ config, draft, fetchImpl = fetch, signal, timeoutMs = 30000 }) {
  const fail = (message, deliveryUnknown = false) => Object.assign(new Error(message), { code: 'email_failed', status: 502, deliveryUnknown });
  if (config.mode !== 'live' || !config.emailEnabled || !config.emailKey || !config.emailFrom) {
    throw fail('Live email is not enabled and configured.');
  }
  if (!draft?.id || !draft.to || !draft.subject || !draft.body) throw fail('An approved RFQ draft is required.');
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  if (signal?.aborted) { signal.removeEventListener('abort', abort); throw fail('Email sending was cancelled.'); }
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => { controller.abort(); reject(fail('Email transmission timed out; verify its provider status before retrying.', true)); }, timeoutMs);
  });
  async function transmit() {
    const response = await fetchImpl('https://api.resend.com/emails', {
      method: 'POST', redirect: 'error', signal: controller.signal,
      headers: { Authorization: `Bearer ${config.emailKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': `procus-rfq-${draft.id}` },
      body: JSON.stringify({ from: config.emailFrom, to: [draft.to], subject: draft.subject, text: draft.body }),
    });
    if (!response.ok) {
      await response.body?.cancel().catch(() => {});
      throw fail(`Email provider rejected the request (HTTP ${response.status}).`, response.status >= 500 || response.status === 429);
    }
    const result = await response.json();
    if (typeof result.id !== 'string' || !result.id) throw fail('Email provider acceptance could not be verified.', true);
    return { providerId: result.id, status: 'accepted' };
  }
  try {
    return await Promise.race([transmit(), timeout]);
  } catch (error) {
    if (error?.code === 'email_failed') throw error;
    throw fail('Email transmission could not be confirmed; verify its provider status before retrying.', true);
  } finally {
    clearTimeout(timer);
    controller.abort();
    signal?.removeEventListener('abort', abort);
  }
}
