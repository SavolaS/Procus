import { mkdir, readFile, writeFile, rename, rm } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, randomUUID } from 'node:crypto';
import { eurostatMetals, parseEurostatMetals, statfinEndpoint, statfinDimensions,
  statfinCatalogMaterials, buildStatfinQuery, parseStatfinMaterials } from '../src/index-sources.js';

const proxyLimitation = 'Domestic product-group producer-price proxy, not a material grade quotation or commodity EUR/kg price. BOM mapping requires explicit review.';
export const indexCatalog = Object.freeze([
  { ...eurostatMetals, material: 'basic-metals', filename: 'eurostat-fi-basic-metals.json' },
  ...statfinCatalogMaterials.map(material => ({
    id: `STATFIN:13m8:${material.code}.2.thi-pisteluku21`, material: material.key,
    label: `Finland — ${material.label}, domestic producer-price proxy`, publisher: 'Statistics Finland',
    sourceUrl: statfinEndpoint, sourceType: 'producer_price_index', productCode: material.code,
    unit: 'Index, 2021=100', currency: 'EUR', geography: 'FI', frequency: 'monthly',
    limitation: proxyLimitation, filename: `statfin-fi-${material.key}.json`,
  })),
].map(Object.freeze));
const hash = text => createHash('sha256').update(text).digest('hex');
const describeError = error => error?.name === 'TimeoutError' || error?.name === 'AbortError'
  ? 'Publisher request timed out; last good observations retained.' : String(error?.message || 'Publisher refresh failed').slice(0, 300);

function validateSnapshot(snapshot, source) {
  if (snapshot?.id !== source.id || snapshot.sourceType !== source.sourceType || snapshot.currency !== source.currency
    || snapshot.unit !== source.unit || snapshot.geography !== source.geography || snapshot.frequency !== source.frequency
    || !Number.isFinite(Date.parse(snapshot.retrievedAt)) || !Number.isFinite(Date.parse(snapshot.providerUpdatedAt))
    || Date.parse(snapshot.providerUpdatedAt) > Date.parse(snapshot.retrievedAt)
    || !Array.isArray(snapshot.observations) || !snapshot.observations.length) throw new Error('Saved index snapshot failed identity or timestamp validation');
  const periods = new Set();
  for (const row of snapshot.observations) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(row?.period) || periods.has(row.period)
      || (row.value !== null && (typeof row.value !== 'number' || !Number.isFinite(row.value) || row.value <= 0))) throw new Error('Saved index snapshot contains invalid observations');
    periods.add(row.period);
  }
  if (!snapshot.observations.some(row => row.value !== null)) throw new Error('Index has no usable observations');
  return snapshot;
}

/** Credential-free public index connectors. Offline mode never makes network requests. */
export async function createIndexService({ config, store, root = new URL('../', import.meta.url), fetchImpl = fetch, onRefresh } = {}) {
  const directory = join(config.dataDir, 'indices');
  const rootPath = root instanceof URL ? fileURLToPath(root) : root;
  let inflight = null;
  let timer = null;
  let stopped = false;
  const readRefresh = () => store.read().indexRefresh;
  const sourceError = id => readRefresh()?.errors?.find(error => error.sourceId === id)?.reason || null;

  async function load(source) {
    let fallbackReason = null;
    if (config.indexMode === 'live') {
      try {
        const snapshot = validateSnapshot(JSON.parse(await readFile(join(directory, source.filename), 'utf8')), source);
        return { ...snapshot, snapshotMode: 'saved_live', sourceError: sourceError(source.id) };
      } catch (error) {
        fallbackReason = error.code === 'ENOENT' ? 'No live snapshot acquired yet; using bundled historical observations.'
          : `Live snapshot unavailable: ${describeError(error)}. Using bundled historical observations.`;
      }
    }
    const snapshot = validateSnapshot(JSON.parse(await readFile(join(rootPath, 'research/data', source.filename), 'utf8')), source);
    return { ...snapshot, snapshotMode: 'bundled_demo', sourceError: config.indexMode === 'live' ? sourceError(source.id) : null, fallbackReason };
  }

  async function readSnapshot(path, encoding) {
    const filename = basename(path instanceof URL ? fileURLToPath(path) : String(path));
    const source = indexCatalog.find(item => item.filename === filename);
    if (!source) throw new Error('Unknown index snapshot');
    const content = JSON.stringify(await load(source));
    return encoding ? content : Buffer.from(content);
  }

  async function list(query = '') {
    const needle = String(query).trim().toLowerCase().replace(/aluminum/g, 'aluminium');
    const selected = indexCatalog.filter(source => !needle || `${source.material} ${source.label} ${source.publisher} ${source.productCode || ''}`.toLowerCase().includes(needle));
    const sources = await Promise.all(selected.map(async source => {
      const { filename, ...catalogEntry } = source;
      try {
        const snapshot = await load(source);
        const latest = snapshot.observations.filter(row => row.value !== null).sort((a, b) => a.period.localeCompare(b.period)).at(-1);
        return { ...catalogEntry, available: true, latestPeriod: latest.period, latestValue: latest.value,
          retrievedAt: snapshot.retrievedAt, providerUpdatedAt: snapshot.providerUpdatedAt, snapshotMode: snapshot.snapshotMode,
          rawSha256: snapshot.rawSha256 || null, error: snapshot.sourceError, fallbackReason: snapshot.fallbackReason || null };
      } catch (error) {
        return { ...catalogEntry, available: false, latestPeriod: null, latestValue: null, retrievedAt: null,
          providerUpdatedAt: null, snapshotMode: 'unavailable', error: sourceError(source.id) || (error.code === 'ENOENT'
            ? 'No bundled observations. Enable live indices and refresh to acquire this series.' : describeError(error)) };
      }
    }));
    return { mode: config.indexMode, sources, lastRefresh: readRefresh() || null,
      errors: config.indexMode === 'live' ? readRefresh()?.errors || [] : [] };
  }

  async function fetchText(url, options = {}) {
    const response = await fetchImpl(url, { ...options, signal: AbortSignal.timeout(config.indexTimeoutMs || 30000) });
    if (!response.ok) throw new Error(`Publisher returned HTTP ${response.status}; last good observations retained.`);
    const text = await response.text();
    if (text.length > 10_000_000) throw new Error('Publisher response exceeds the supported size');
    return text;
  }

  async function immutable(filename, content) {
    try { await writeFile(join(directory, filename), content, { flag: 'wx', mode: 0o600 }); }
    catch (error) { if (error.code !== 'EEXIST') throw error; }
  }
  async function save(source, snapshot, raw, metadataRaw, query) {
    validateSnapshot(snapshot, source);
    await mkdir(directory, { recursive: true, mode: 0o700 });
    const rawSha256 = hash(raw);
    const metadataSha256 = metadataRaw ? hash(metadataRaw) : null;
    const saved = { ...snapshot, rawSha256, ...(metadataSha256 ? { metadataSha256, sourceQuery: query } : {}) };
    await immutable(`raw-${rawSha256}.json`, raw);
    if (metadataRaw) await immutable(`metadata-${metadataSha256}.json`, metadataRaw);
    const content = JSON.stringify(saved, null, 2);
    await immutable(`vintage-${hash(content)}.json`, content);
    const temporary = join(directory, `${source.filename}.${randomUUID()}.tmp`);
    try {
      await writeFile(temporary, content, { flag: 'wx', mode: 0o600 });
      await rename(temporary, join(directory, source.filename));
    } finally { await rm(temporary, { force: true }); }
  }

  function refresh() {
    if (config.indexMode !== 'live') return Promise.resolve({ mode: 'snapshot', status: 'skipped', updatedSourceIds: [], errors: [], completedAt: new Date().toISOString() });
    if (inflight) return inflight;
    inflight = (async () => {
      const startedAt = new Date().toISOString();
      const errors = [];
      const updatedSourceIds = [];
      async function attempt(source, operation) {
        try { await operation(); updatedSourceIds.push(source.id); }
        catch (error) { errors.push({ sourceId: source.id, reason: describeError(error) }); }
      }
      await Promise.all([
        attempt(indexCatalog[0], async () => {
          const raw = await fetchText(eurostatMetals.sourceUrl);
          await save(indexCatalog[0], parseEurostatMetals(JSON.parse(raw), new Date().toISOString()), raw);
        }),
        (async () => {
          let metadataRaw;
          let metadata;
          try { metadataRaw = await fetchText(statfinEndpoint); metadata = JSON.parse(metadataRaw); }
          catch (error) {
            for (const source of indexCatalog.slice(1)) errors.push({ sourceId: source.id, reason: describeError(error) });
            return;
          }
          const periods = metadata.variables?.find(variable => variable.code === statfinDimensions.time)?.values
            ?.filter(period => /^\d{4}M(0[1-9]|1[0-2])$/.test(period) && period >= '2025M01');
          const productCodes = metadata.variables?.find(variable => variable.code === statfinDimensions.product)?.values;
          // Isolate missing/suppressed material series: failure must not erase other sources.
          for (const material of statfinCatalogMaterials) {
            const source = indexCatalog.find(item => item.material === material.key);
            await attempt(source, async () => {
              if (!productCodes?.includes(material.code)) throw new Error(`Publisher metadata does not contain ${material.key}`);
              const query = buildStatfinQuery(periods, [material]);
              const raw = await fetchText(statfinEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(query) });
              const [snapshot] = parseStatfinMaterials(JSON.parse(raw), new Date().toISOString(), [material]);
              await save(source, snapshot, raw, metadataRaw, query);
            });
          }
        })(),
      ]);
      const result = { mode: 'live', status: errors.length ? (updatedSourceIds.length ? 'partial' : 'failed') : 'succeeded',
        startedAt, completedAt: new Date().toISOString(), updatedSourceIds, errors };
      await store.update(state => { state.indexRefresh = result; });
      if (onRefresh) await onRefresh(result);
      return result;
    })().finally(() => { inflight = null; });
    return inflight;
  }

  function start() {
    stopped = false;
    if (config.indexMode !== 'live' || timer) return Promise.resolve(null);
    timer = setInterval(() => { if (!stopped) refresh().catch(error => console.error('Index refresh failed:', describeError(error))); }, (config.indexRefreshHours || 24) * 3600000);
    timer.unref?.();
    return refresh();
  }
  async function stop() { stopped = true; clearInterval(timer); timer = null; if (inflight) await inflight; }
  return { list, refresh, readSnapshot, start, stop };
}
