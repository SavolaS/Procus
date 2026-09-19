import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { products } from '../src/data.js';
import { createPricingService } from '../pricing-service.mjs';

const repo = new URL('../', import.meta.url);
const files = ['eurostat-fi-basic-metals.json', 'statfin-fi-steel.json', 'statfin-fi-copper.json'];
const steelId = 'STATFIN:13m8:241.2.thi-pisteluku21';

async function startServer(t) {
  const folder = await mkdtemp(join(tmpdir(), 'procus-pricing-server-'));
  let child;
  t.after(async () => {
    if (child && child.exitCode === null) { const exited = once(child, 'exit'); child.kill(); await exited; }
    await rm(folder, { recursive: true, force: true });
  });
  await cp(new URL('server.mjs', repo), join(folder, 'server.mjs'));
  await cp(new URL('pricing-service.mjs', repo), join(folder, 'pricing-service.mjs'));
  await cp(new URL('src/', repo), join(folder, 'src'), { recursive: true });
  await cp(new URL('index.html', repo), join(folder, 'index.html'));
  await writeFile(join(folder, 'package.json'), '{"type":"module"}\n');
  await mkdir(join(folder, 'research/data'), { recursive: true });
  for (const filename of files) await cp(new URL(`research/data/${filename}`, repo), join(folder, 'research/data', filename));
  child = spawn(process.execPath, ['server.mjs'], { cwd: folder, env: { ...process.env, PROCUS_PORT: '0', PROCUS_HOST: '127.0.0.1' }, stdio: ['ignore', 'pipe', 'pipe'] });
  const base = await new Promise((resolve, reject) => {
    let stderr = '';
    const timeout = setTimeout(() => reject(new Error(`Server startup timed out: ${stderr}`)), 10000);
    const fail = error => { clearTimeout(timeout); reject(error); };
    child.once('error', fail);
    child.once('exit', code => fail(new Error(`Server exited ${code}: ${stderr}`)));
    child.stderr.on('data', data => { stderr += data; });
    child.stdout.on('data', data => {
      const url = data.toString().match(/http:\/\/127\.0\.0\.1:\d+/)?.[0];
      if (url) { clearTimeout(timeout); resolve(url); }
    });
  });
  return { base, folder };
}

test('pricing HTTP API analyzes the portfolio and keeps source files/private endpoints inaccessible', async t => {
  const { base } = await startServer(t);
  const response = await fetch(`${base}/api/pricing-analysis`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /application\/json/);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.match(response.headers.get('content-security-policy'), /default-src 'self'/);
  const payload = await response.json();
  assert.ok(Number.isFinite(Date.parse(payload.analyzedAt)));
  assert.equal(Object.keys(payload.results).length, products.length);
  assert.deepEqual(payload.sourceErrors, []);
  assert.match(payload.evidenceVersion, /^[a-f0-9]{64}$/);
  assert.equal(payload.summary.total, products.length);
  assert.equal(payload.summary.review_price + payload.summary.no_cost_gap + payload.summary.insufficient_evidence, products.length);
  assert.equal(payload.snapshotMode, 'bundled_demo');
  assert.equal(payload.pipeline.inputSourceCount, 3);
  assert.equal(payload.pipeline.analyzedProductCount, products.length);
  assert.equal(payload.pipeline.mappedBOMCount, Object.values(payload.results).filter(result => result.bom).length);
  assert.equal(payload.pipeline.eligibleQuoteCount, Object.values(payload.results).reduce((count, result) => count + result.references.eligible.length, 0));
  assert.equal(payload.pipeline.excludedQuoteCount, Object.values(payload.results).reduce((count, result) => count + result.references.excluded.length, 0));
  const statuses = new Set(['review_price', 'no_cost_gap', 'insufficient_evidence']);
  for (const product of products) {
    assert.ok(statuses.has(payload.results[product.id].status));
    assert.equal(payload.results[product.id].analyzedAt, payload.analyzedAt);
    assert.ok(Array.isArray(payload.results[product.id].references.eligible));
  }
  assert.ok(Object.values(payload.results).some(result => result.status !== 'insufficient_evidence'));
  for (const path of ['/api/pricing-index', '/research/data/statfin-fi-steel.json', '/research/data/eurostat-fi-basic-metals.json', '/server.mjs', '/src/../research/data/statfin-fi-steel.json']) {
    const denied = await fetch(`${base}${path}`);
    assert.equal(denied.status, 404, path);
    assert.doesNotMatch(await denied.text(), /observations|rawSha256|\/Users\//);
  }
  const head = await fetch(`${base}/api/pricing-analysis`, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  const post = await fetch(`${base}/api/pricing-analysis`, { method: 'POST', body: '{}' });
  assert.equal(post.status, 405);
  assert.equal(post.headers.get('allow'), 'GET, HEAD');
});

test('cached analysis is shared across concurrent requests and does not reread demo inputs', async () => {
  let scans = 0;
  let reads = 0;
  let release;
  const wait = new Promise(resolve => { release = resolve; });
  const service = createPricingService({ products: [],
    analyze: () => { scans++; return {}; },
    readSnapshot: async () => { reads++; await wait; throw new Error('fixture missing'); },
  });
  const first = service.start();
  assert.equal(first, service.start());
  assert.equal(reads, 3);
  const apiWait = service.getLatest();
  release();
  const initial = await first;
  assert.equal(await apiWait, initial);
  assert.equal(await service.getLatest(), initial);
  assert.equal(await service.start(), initial);
  assert.equal(scans, 1);
  assert.equal(reads, 3);
  assert.equal(initial.sourceErrors.length, 3);
});

test('fresh demo analysis isolates missing or invalid sources without substituted prices', async () => {
  async function load(steel) {
    const service = createPricingService({ products, readSnapshot: async path => {
      if (path.pathname.endsWith('statfin-fi-steel.json')) {
        if (steel === null) throw new Error('fixture missing');
        return steel;
      }
      return readFile(path, 'utf8');
    } });
    return service.getLatest();
  }
  const saved = await readFile(new URL('research/data/statfin-fi-steel.json', repo), 'utf8');
  const original = await load(saved);
  for (const steel of [null, '{invalid json', JSON.stringify({ ...JSON.parse(saved), unit: 'Index, 2015=100' })]) {
    const missing = await load(steel);
    assert.deepEqual(missing.sourceErrors.map(error => error.sourceId), [steelId]);
    assert.notEqual(missing.evidenceVersion, original.evidenceVersion);
    assert.ok(Object.entries(original.results).some(([id, result]) => result.status !== 'insufficient_evidence' && missing.results[id].status === 'insufficient_evidence'));
    assert.ok(Object.values(missing.results).some(result => result.status !== 'insufficient_evidence'));
    assert.doesNotMatch(JSON.stringify(missing.sourceErrors), /research\/|\/Users\/|ENOENT/);
  }
  const offline = await createPricingService({ products, readSnapshot: async () => { throw new Error('offline'); } }).getLatest();
  assert.equal(offline.sourceErrors.length, 3);
  assert.ok(Object.values(offline.results).every(result => result.status === 'insufficient_evidence'));
});

test('evidence versions reflect inputs and reference eligibility, not analysis bookkeeping', async () => {
  let asOf = '2026-09-19T10:00:00Z';
  let referenceValid = true;
  let raw = await readFile(new URL('research/data/statfin-fi-steel.json', repo), 'utf8');
  const analyze = async () => createPricingService({ products: [{ id: 'test' }], now: () => asOf,
    readSnapshot: async path => { if (path.pathname.endsWith('statfin-fi-steel.json')) return raw; throw new Error('fixture missing'); },
    analyze: () => ({ test: { status: 'no_cost_gap', analyzedAt: asOf } }),
    compareReferences: () => ({ eligible: referenceValid ? [{ id: 'quote' }] : [], excluded: referenceValid ? [] : [{ id: 'quote', reason: 'Expired' }] }),
  }).getLatest();
  const original = await analyze();
  asOf = '2026-09-19T11:00:00Z';
  assert.equal((await analyze()).evidenceVersion, original.evidenceVersion);
  raw = JSON.stringify({ ...JSON.parse(raw), retrievedAt: '2026-09-19T09:00:00Z', rawSha256: 'new-bookkeeping-hash' });
  assert.equal((await analyze()).evidenceVersion, original.evidenceVersion);
  const changed = JSON.parse(raw);
  changed.observations.at(-1).value += 1;
  raw = JSON.stringify(changed);
  const revised = await analyze();
  assert.notEqual(revised.evidenceVersion, original.evidenceVersion);
  referenceValid = false;
  asOf = '2026-09-20T00:00:00Z';
  assert.notEqual((await analyze()).evidenceVersion, revised.evidenceVersion);
});
