import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { products } from './src/data.js';
import { createPricingService } from './pricing-service.mjs';
import { readConfig } from './backend/config.mjs';
import { createStore } from './backend/store.mjs';
import { createWorkspace } from './backend/workspace.mjs';
import { createIndexService } from './backend/indices.mjs';
import { createBackendHandler } from './backend/http.mjs';

const root = new URL('./', import.meta.url);
const types = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
]);

// Research snapshots stay private; the API returns automatic per-part analysis.
function resolve(pathname) {
  if (pathname === '/' || pathname === '/index.html') return ['index.html', types.get('.html')];
  if (!/^\/src\/[a-z0-9-]+\.(css|js)$/.test(pathname)) return null;
  return [pathname.slice(1), types.get(pathname.slice(pathname.lastIndexOf('.')))];
}

const config = readConfig();
const store = await createStore(config.dataDir);
const indices = await createIndexService({ config, store, root, onRefresh: async () => pricingService.invalidate() });
const pricingService = createPricingService({ root, products, readSnapshot: indices.readSnapshot });
const workspace = createWorkspace({ config, store, products });
void pricingService.start().catch(() => {});
void indices.start().catch(() => {});

const securityHeaders = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'",
};

const port = Number(process.env.PROCUS_PORT || 5173);
const host = process.env.PROCUS_HOST || '127.0.0.1';
const handleBackend = createBackendHandler({ config, workspace, indices, pricingService, securityHeaders });
const server = createServer(async (request, response) => {
  let url;
  try { url = new URL(request.url, 'http://localhost'); }
  catch { response.writeHead(400); response.end('Invalid URL'); return; }
  if (await handleBackend(request, response, url)) return;
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end('Method not allowed');
    return;
  }
  const pathname = url.pathname;
  if (pathname === '/api/pricing-analysis') {
    try {
      const content = JSON.stringify(await pricingService.getLatest());
      response.writeHead(200, { ...securityHeaders, 'Content-Type': 'application/json; charset=utf-8' });
      response.end(request.method === 'HEAD' ? undefined : content);
    } catch {
      response.writeHead(500, { ...securityHeaders, 'Content-Type': 'application/json; charset=utf-8' });
      response.end(request.method === 'HEAD' ? undefined : JSON.stringify({ error: 'Unable to analyze pricing' }));
    }
    return;
  }
  const entry = resolve(pathname);
  if (!entry) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }
  try {
    const content = await readFile(fileURLToPath(new URL(entry[0], root)));
    response.writeHead(200, {
      ...securityHeaders,
      'Content-Type': entry[1],
    });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch {
    response.writeHead(500, { 'Content-Type': 'text/plain' });
    response.end('Unable to load application');
  }
});

server.on('error', error => {
  console.error(`Could not start Procus: ${error.message}`);
  process.exitCode = 1;
  void indices.stop().then(() => store.close());
});
server.listen(port, host, () => {
  console.log(`Procus is running at http://${host}:${server.address().port}`);
});

let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  const connectionsClosed = new Promise(resolve => server.close(resolve));
  const indicesStopped = indices.stop();
  await connectionsClosed;
  await indicesStopped;
  await workspace.idle();
  await store.close();
}
process.on('SIGTERM', () => void stop());
process.on('SIGINT', () => void stop());
