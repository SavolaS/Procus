import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('./', import.meta.url);
const types = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
]);

// Only index.html and plain source files under /src are served, by extension.
function resolve(pathname) {
  if (pathname === '/' || pathname === '/index.html') return ['index.html', types.get('.html')];
  if (!/^\/src\/[a-z0-9-]+\.(css|js)$/.test(pathname)) return null;
  return [pathname.slice(1), types.get(pathname.slice(pathname.lastIndexOf('.')))];
}

const port = Number(process.env.PROCUS_PORT || 5173);
const server = createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end('Method not allowed');
    return;
  }
  const pathname = new URL(request.url, 'http://localhost').pathname;
  const entry = resolve(pathname);
  if (!entry) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }
  try {
    const content = await readFile(fileURLToPath(new URL(entry[0], root)));
    response.writeHead(200, {
      'Content-Type': entry[1],
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'",
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
});
server.listen(port, '127.0.0.1', () => {
  console.log(`Procus is running at http://127.0.0.1:${port}`);
});
