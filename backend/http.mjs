import { timingSafeEqual } from 'node:crypto';
import { isIP } from 'node:net';
import { publicConfig } from './config.mjs';
import { problem } from './validation.mjs';

async function readBody(request) {
  if (!request.headers['content-type']?.startsWith('application/json')) throw problem('Use application/json', 415);
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 32768) throw problem('Request body exceeds 32 KB', 413);
    chunks.push(chunk);
  }
  let value;
  try { value = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw problem('Invalid JSON'); }
  if (!value || Array.isArray(value) || typeof value !== 'object') throw problem('Expected a JSON object');
  return value;
}

function authorize(request, config, publicRoute) {
  let host;
  try { host = new URL(`http://${request.headers.host}`).hostname; } catch { throw problem('Invalid host', 403); }
  // Local service: reject arbitrary DNS names, including DNS rebinding hosts.
  if (host !== 'localhost' && !isIP(host.replace(/^\[|\]$/g, ''))) throw problem('Use localhost or the server IP address', 403);
  if (request.headers.origin && request.headers.origin !== `http://${request.headers.host}`) throw problem('Cross-origin requests are not allowed', 403);
  if (request.headers['sec-fetch-site'] === 'cross-site') throw problem('Cross-site requests are not allowed', 403);
  if (config.mode === 'live' && !publicRoute) {
    const actual = Buffer.from(request.headers.authorization || '');
    const expected = Buffer.from(`Bearer ${config.apiToken}`);
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw problem('Workspace token required', 401);
  }
}

export function createBackendHandler({ config, workspace, indices, pricingService, securityHeaders }) {
  return async (request, response, url) => {
    if (!url.pathname.startsWith('/api/backend/')) return false;
    const send = (status, value, headers = {}) => {
      response.writeHead(status, { ...securityHeaders, ...headers, 'Content-Type': 'application/json; charset=utf-8' });
      response.end(request.method === 'HEAD' ? undefined : JSON.stringify(value));
    };
    try {
      const path = url.pathname.slice('/api/backend/'.length);
      authorize(request, config, path === 'config');
      const reads = ['config', 'workspace', 'indices'];
      const writes = ['runs', 'drafts', 'indices/refresh'];
      const sendMatch = path.match(/^drafts\/([a-f0-9-]{36})\/send$/);
      if (!reads.includes(path) && !writes.includes(path) && !sendMatch) throw problem('Not found', 404);
      const allowed = reads.includes(path) ? ['GET', 'HEAD'] : ['POST'];
      if (!allowed.includes(request.method)) { send(405, { error: 'Method not allowed' }, { Allow: allowed.join(', ') }); return true; }
      if (path === 'config') send(200, publicConfig(config));
      else if (path === 'workspace') send(200, workspace.snapshot());
      else if (path === 'indices') send(200, await indices.list((url.searchParams.get('q') || '').slice(0, 150)));
      else {
        const body = await readBody(request);
        if (path === 'runs') send(202, await workspace.createRun(body));
        else if (path === 'drafts') send(201, await workspace.createDraft(body));
        else if (sendMatch) send(202, await workspace.sendDraft(sendMatch[1], body));
        else {
          const result = await indices.refresh();
          await pricingService.invalidate();
          send(200, result);
        }
      }
    } catch (error) {
      send(error.status || 500, { error: error.status ? error.message : 'Backend operation failed. Check server configuration and try again.' });
    }
    return true;
  };
}
