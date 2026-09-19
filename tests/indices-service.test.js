import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createStore } from '../backend/store.mjs';
import { createIndexService, indexCatalog } from '../backend/indices.mjs';
import { statfinDimensions as dim, statfinCatalogMaterials, buildStatfinQuery, parseStatfinMaterials } from '../src/index-sources.js';

const root = new URL('../', import.meta.url);
async function setup(t, indexMode = 'snapshot', fetchImpl = () => { throw new Error('Unexpected network access'); }, extra = {}) {
  const directory = await mkdtemp(join(tmpdir(), 'procus-indices-'));
  const store = await createStore(directory);
  const config = { dataDir: directory, indexMode, indexRefreshHours: 24, ...extra };
  const service = await createIndexService({ config, store, root, fetchImpl, ...extra });
  t.after(async () => { await service.stop(); await store.close(); await rm(directory, { recursive: true, force: true }); });
  return { service, directory, store, config };
}
function dataset(code) {
  return { class: 'dataset', id: [dim.time, dim.measure, dim.product, dim.market], size: [2, 1, 1, 1],
    updated: '2025-03-01T00:00:00Z',
    dimension: {
      [dim.time]: { category: { index: { '2025M01': 0, '2025M02': 1 } } },
      [dim.product]: { category: { index: { [code]: 0 } } },
      [dim.market]: { category: { index: { '2': 0 } } },
      [dim.measure]: { category: { index: { 'thi-pisteluku21': 0 }, unit: { 'thi-pisteluku21': { base: 'index point' } } } },
    }, value: { 0: 100, 1: 104 },
  };
}
async function goodFetcher(url, options = {}) {
  assert.ok(options.signal instanceof AbortSignal);
  if (url.includes('eurostat')) {
    const raw = await readFile(new URL('research/data/eurostat-21de915de4a91309f979470ca858d33133dccf30527feeae8a9faa00f0d10c35.json', root), 'utf8');
    return new Response(raw);
  }
  if (!options.method) return Response.json({ variables: [
    { code: dim.time, values: ['2024M12', '2025M01', '2025M02'] },
    { code: dim.product, values: statfinCatalogMaterials.map(row => row.code) },
  ] });
  const query = JSON.parse(options.body);
  return Response.json(dataset(query.query.find(row => row.code === dim.product).selection.values[0]));
}

test('offline startup and refresh use bundled observations with searchable honest coverage', async t => {
  const { service } = await setup(t);
  await service.start();
  const refreshed = await service.refresh();
  assert.equal(refreshed.status, 'skipped');
  const result = await service.list();
  assert.equal(result.sources.length, 5);
  assert.equal(result.sources.filter(source => source.available).length, 3);
  assert.ok(result.sources.filter(source => source.available).every(source => source.snapshotMode === 'bundled_demo'));
  const aluminium = await service.list('aluminum');
  assert.equal(aluminium.sources[0].material, 'aluminium');
  assert.equal(aluminium.sources[0].latestValue, null);
  assert.match(aluminium.sources[0].error, /No bundled/);
  assert.match(aluminium.sources[0].limitation, /not a material grade/);
  const snapshot = JSON.parse(await service.readSnapshot(new URL('research/data/statfin-fi-steel.json', root), 'utf8'));
  assert.equal(snapshot.snapshotMode, 'bundled_demo');
  assert.equal(snapshot.sourceError, null);
});

test('successful refresh persists atomic source aliases, query/raw provenance, and survives recreation', async t => {
  let callbacks = 0;
  const { service, directory, config, store } = await setup(t, 'live', goodFetcher, { onRefresh: () => { callbacks++; } });
  const [one, two] = await Promise.all([service.refresh(), service.refresh()]);
  assert.deepEqual(one, two);
  assert.equal(one.status, 'succeeded');
  assert.equal(one.updatedSourceIds.length, 5);
  assert.equal(callbacks, 1);
  const recreated = await createIndexService({ config, store, root, fetchImpl: goodFetcher });
  const result = await recreated.list();
  assert.ok(result.sources.every(source => source.available && source.snapshotMode === 'saved_live'));
  const snapshot = JSON.parse(await recreated.readSnapshot('statfin-fi-plastics.json', 'utf8'));
  assert.equal(snapshot.latestValue, undefined);
  assert.equal(snapshot.observations.at(-1).value, 104);
  const raw = JSON.parse(await readFile(join(directory, 'indices', `raw-${snapshot.rawSha256}.json`)));
  assert.deepEqual(raw, dataset('2016'));
  assert.ok(snapshot.metadataSha256);
  assert.equal(snapshot.sourceQuery.query[0].selection.values[0], '2016');
  assert.equal(store.read().indexRefresh.status, 'succeeded');
  assert.ok(!(await readdir(join(directory, 'indices'))).some(file => file.endsWith('.tmp')));
  const demo = await createIndexService({ config: { ...config, indexMode: 'snapshot' }, store, root });
  const demoSteel = JSON.parse(await demo.readSnapshot('statfin-fi-steel.json', 'utf8'));
  assert.equal(demoSteel.snapshotMode, 'bundled_demo');
});

test('publisher failure retains last good snapshot and exposes errors without claiming fresh acquisition', async t => {
  let fail = false;
  const { service } = await setup(t, 'live', (...args) => fail ? Promise.resolve(new Response('', { status: 503 })) : goodFetcher(...args));
  await service.refresh();
  const before = JSON.parse(await service.readSnapshot('statfin-fi-steel.json', 'utf8'));
  fail = true;
  const result = await service.refresh();
  assert.equal(result.status, 'failed');
  assert.equal(result.errors.length, 5);
  const after = JSON.parse(await service.readSnapshot('statfin-fi-steel.json', 'utf8'));
  assert.equal(after.retrievedAt, before.retrievedAt);
  assert.equal(after.rawSha256, before.rawSha256);
  assert.match(after.sourceError, /503/);
  assert.equal(after.snapshotMode, 'saved_live');
  assert.equal((await service.list('steel')).sources[0].error, after.sourceError);
});

test('one missing material does not block other acquisitions and live fallback is labeled', async t => {
  const { service } = await setup(t, 'live', (url, options) => {
    if (options.method && JSON.parse(options.body).query[0].selection.values[0] === '2442') return Promise.resolve(Response.json(dataset('2444')));
    return goodFetcher(url, options);
  });
  const before = JSON.parse(await service.readSnapshot('statfin-fi-steel.json', 'utf8'));
  assert.equal(before.snapshotMode, 'bundled_demo');
  assert.match(before.fallbackReason, /No live snapshot/);
  const result = await service.refresh();
  assert.equal(result.status, 'partial');
  assert.equal(result.updatedSourceIds.length, 4);
  assert.equal(result.errors[0].sourceId, indexCatalog.find(source => source.material === 'aluminium').id);
  assert.equal((await service.list('aluminium')).sources[0].available, false);
});

test('corrupt persisted identity is never presented as the requested material', async t => {
  const { service, directory } = await setup(t, 'live', goodFetcher);
  await service.refresh();
  const copper = await readFile(join(directory, 'indices/statfin-fi-copper.json'));
  await writeFile(join(directory, 'indices/statfin-fi-steel.json'), copper);
  const steel = JSON.parse(await service.readSnapshot('statfin-fi-steel.json', 'utf8'));
  assert.equal(steel.id, 'STATFIN:13m8:241.2.thi-pisteluku21');
  assert.equal(steel.snapshotMode, 'bundled_demo');
  assert.match(steel.fallbackReason, /identity/);
  await assert.rejects(service.readSnapshot('../workspace.json', 'utf8'), /Unknown index/);
});

test('expanded material query and decoder preserve explicit material identity', () => {
  for (const material of statfinCatalogMaterials) {
    const query = buildStatfinQuery(['2025M01'], [material]);
    assert.deepEqual(query.query[0].selection.values, [material.code]);
    const [series] = parseStatfinMaterials(dataset(material.code), '2025-04-01T00:00:00Z', [material]);
    assert.equal(series.key, material.key);
    assert.equal(series.productCode, material.code);
  }
  assert.throws(() => buildStatfinQuery(['2025M01'], [{ code: 'unknown', key: 'steel' }]), /Unsupported/);
});
