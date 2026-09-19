import { resolve } from 'node:path';

export function readConfig(env = process.env) {
  const mode = env.PROCUS_MODE || 'demo';
  if (!['demo', 'live'].includes(mode)) throw new Error('PROCUS_MODE must be demo or live');
  const config = {
    mode, dataDir: resolve(env.PROCUS_DATA_DIR || `.procus/${mode}`),
    apiToken: env.PROCUS_API_TOKEN || '', openaiKey: env.OPENAI_API_KEY || '',
    model: env.OPENAI_MODEL || 'gpt-6-astra',
    emailKey: env.RESEND_API_KEY || '', emailFrom: env.PROCUS_EMAIL_FROM || '',
    emailEnabled: mode === 'live' && env.PROCUS_EMAIL_ENABLED === 'true',
    indexMode: env.PROCUS_INDEX_MODE || (mode === 'demo' ? 'snapshot' : 'live'),
    indexRefreshHours: Number(env.PROCUS_INDEX_REFRESH_HOURS || 24),
  };
  if (!['snapshot', 'live'].includes(config.indexMode)) throw new Error('Invalid PROCUS_INDEX_MODE');
  if (!Number.isFinite(config.indexRefreshHours) || config.indexRefreshHours < 1) throw new Error('Index refresh interval must be at least one hour');
  if (mode === 'live' && config.apiToken.length < 24) throw new Error('Live mode requires a PROCUS_API_TOKEN of at least 24 characters');
  if (config.emailEnabled && (!config.emailKey || !config.emailFrom || !config.openaiKey)) throw new Error('Live email requires RESEND_API_KEY, PROCUS_EMAIL_FROM and OPENAI_API_KEY');
  return config;
}

export function publicConfig(config) {
  return { mode: config.mode, discovery: config.mode === 'demo' ? 'demo' : config.openaiKey ? 'openai' : 'unconfigured',
    email: config.mode === 'demo' ? 'simulated' : config.emailEnabled ? 'resend' : 'disabled', indexMode: config.indexMode };
}
