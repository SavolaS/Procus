import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { products } from '../src/data.js';
import { createPricingService } from '../pricing-service.mjs';
import { createIndexService } from '../backend/indices.mjs';
import { createStore } from '../backend/store.mjs';

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
  await cp(new URL('backend/', repo), join(folder, 'backend'), { recursive: true });
  await cp(new URL('src/', repo), join(folder, 'src'), { recursive: true });
  await cp(new URL('index.html', repo), join(folder, 'index.html'));
  await writeFile(join(folder, 'package.json'), '{"type":"module"}\n');
  await mkdir(join(folder, 'research/data'), { recursive: true });
  for (const filename of files) await cp(new URL(`research/data/${filename}`, repo), join(folder, 'research/data', filename));
  child = spawn(process.execPath, ['server.mjs'], { cwd: folder, env: { ...process.env, PROCUS_MODE: 'demo', PROCUS_INDEX_MODE: 'snapshot', PROCUS_DATA_DIR: join(folder, '.procus'), PROCUS_PORT: '0', PROCUS_HOST: '127.0.0.1' }, stdio: ['ignore', 'pipe', 'pipe'] });
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

test('invalidation applies revised observations and retains source errors and mixed provenance', async () => {
  let reads = 0;
  const snapshots = Object.fromEntries(await Promise.all(files.map(async filename => [filename,
    { ...JSON.parse(await readFile(new URL(`research/data/${filename}`, repo), 'utf8')), snapshotMode: 'saved_live' },
  ])));
  const service = createPricingService({ products, readSnapshot: async path => {
    reads++;
    return JSON.stringify(snapshots[path.pathname.split('/').at(-1)]);
  } });
  const original = await service.getLatest();
  assert.equal(original.snapshotMode, 'saved_live');
  assert.deepEqual(original.sourceErrors, []);
  const steel = snapshots['statfin-fi-steel.json'];
  steel.observations.filter(row => row.value !== null).at(-1).value *= 1.2;
  steel.sourceError = 'Publisher returned HTTP 503; last good observations retained.';
  snapshots['statfin-fi-copper.json'].snapshotMode = 'bundled_demo';
  assert.equal(await service.getLatest(), original, 'cache remains stable until acquisition invalidates it');
  await service.invalidate();
  const revised = await service.getLatest();
  assert.equal(reads, 6);
  assert.notEqual(revised.evidenceVersion, original.evidenceVersion);
  assert.notDeepEqual(revised.results, original.results, 'revised index affects actual portfolio analysis');
  assert.equal(revised.snapshotMode, 'mixed_snapshots');
  assert.deepEqual(revised.sourceErrors, [{ sourceId: steelId, reason: steel.sourceError }]);
  assert.equal(await service.getLatest(), revised);
});

test('startup and scheduled index refresh invalidate pricing without waiting on themselves', { timeout: 3000 }, async t => {
  const directory = await mkdtemp(join(tmpdir(), 'procus-index-pricing-'));
  const store = await createStore(directory);
  let scheduled;
  t.mock.method(globalThis, 'setInterval', callback => { scheduled = callback; return { unref() {} }; });
  let pricing;
  let invalidations = 0;
  let providerStatus = 503;
  const indices = await createIndexService({ root: repo, store,
    config: { dataDir: directory, indexMode: 'live', indexRefreshHours: 24 },
    fetchImpl: async () => new Response('', { status: providerStatus }),
    onRefresh: async () => { invalidations++; await pricing.invalidate(); },
  });
  t.after(async () => { await indices.stop(); await store.close(); await rm(directory, { recursive: true, force: true }); });
  pricing = createPricingService({ products, readSnapshot: indices.readSnapshot });
  const firstScan = pricing.start();
  await indices.start();
  await firstScan;
  const initial = await pricing.getLatest();
  assert.equal(invalidations, 1);
  assert.equal(initial.snapshotMode, 'bundled_demo');
  assert.equal(initial.pipeline.inputSourceCount, 3, 'historical snapshots remain usable during publisher failure');
  assert.equal(initial.sourceErrors.length, 3);
  assert.ok(initial.sourceErrors.every(error => /503/.test(error.reason)));
  providerStatus = 429;
  scheduled();
  await indices.refresh(); // Coalesces with the timer-triggered refresh.
  const updated = await pricing.getLatest();
  assert.equal(invalidations, 2);
  assert.notEqual(updated.evidenceVersion, initial.evidenceVersion);
  assert.ok(updated.sourceErrors.every(error => /429/.test(error.reason)));
  assert.equal(updated.snapshotMode, 'bundled_demo');
  const catalog = await indices.list('steel');
  assert.match(catalog.sources[0].fallbackReason, /No live snapshot acquired/);
  assert.match(catalog.sources[0].error, /429/);
});

test('pricing exposes a historical fallback reason even before publisher refresh records an error', async () => {
  const reason = 'Live snapshot unavailable: Saved index snapshot failed identity validation. Using bundled historical observations.';
  const service = createPricingService({ products, readSnapshot: async path => {
    const snapshot = JSON.parse(await readFile(path, 'utf8'));
    return JSON.stringify({ ...snapshot, snapshotMode: 'bundled_demo',
      ...(snapshot.id === steelId ? { fallbackReason: reason, sourceError: null } : {}),
    });
  } });
  const result = await service.getLatest();
  assert.equal(result.snapshotMode, 'bundled_demo');
  assert.equal(result.pipeline.inputSourceCount, 3);
  assert.deepEqual(result.sourceErrors, [{ sourceId: steelId, reason }]);
});
