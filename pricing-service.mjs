import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { analyzePortfolio } from './src/automatic-pricing.js';
import { compareReferencePrices } from './src/reference-prices.js';

const sources = [
  ['eurostat-fi-basic-metals.json', 'ESTAT:sts_inppd_m:M.PRC_PRR_DOM.C24.NSA.I21.FI'],
  ['statfin-fi-steel.json', 'STATFIN:13m8:241.2.thi-pisteluku21'],
  ['statfin-fi-copper.json', 'STATFIN:13m8:2444.2.thi-pisteluku21'],
];

function validSnapshot(snapshot, id) {
  if (snapshot?.id !== id || snapshot.currency !== 'EUR' || snapshot.unit !== 'Index, 2021=100'
      || snapshot.geography !== 'FI' || snapshot.frequency !== 'monthly' || snapshot.sourceType !== 'producer_price_index'
      || !Array.isArray(snapshot.observations) || !snapshot.observations.length
      || !Number.isFinite(Date.parse(snapshot.retrievedAt)) || !Number.isFinite(Date.parse(snapshot.providerUpdatedAt))) return false;
  const periods = new Set();
  for (const observation of snapshot.observations) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(observation?.period) || periods.has(observation.period)
        || (observation.value !== null && (typeof observation.value !== 'number' || !Number.isFinite(observation.value) || observation.value <= 0))) return false;
    periods.add(observation.period);
  }
  return true;
}

// Exclude scan/retrieval bookkeeping, including hashes that may change for timestamp-only refreshes.
// Reference validity dates, observation periods/statuses and calculation outputs remain substantive.
const bookkeeping = new Set(['analyzedAt', 'asOf', 'retrievedAt', 'providerUpdatedAt', 'rawSha256', 'metadataSha256']);
function evidence(value) {
  if (Array.isArray(value)) return value.map(evidence);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort()
    .filter(key => !bookkeeping.has(key)).map(key => [key, evidence(value[key])]));
  return value;
}

/** Analyze validated snapshots; an injected index service owns acquisition and refresh. */
export function createPricingService({ root = new URL('./', import.meta.url), products,
  analyze = analyzePortfolio, compareReferences = compareReferencePrices,
  readSnapshot = readFile, now = () => new Date().toISOString() } = {}) {
  let latest = null;
  let inflight = null;
  let lastError = null;

  function start() {
    if (latest) return Promise.resolve(latest);
    if (inflight) return inflight;
    inflight = (async () => {
      const loaded = await Promise.all(sources.map(async ([filename, id]) => {
        try {
          const snapshot = JSON.parse(await readSnapshot(new URL(`research/data/${filename}`, root), 'utf8'));
          if (!validSnapshot(snapshot, id)) throw new Error('Invalid snapshot');
          return { id, snapshot };
        } catch { return { id, error: { sourceId: id, reason: 'Saved source unavailable or invalid' } }; }
      }));
      const sourceErrors = loaded.filter(item => item.error).map(item => item.error);
      for (const item of loaded) {
        const warnings = [item.snapshot?.sourceError, item.snapshot?.fallbackReason].filter(Boolean);
        if (warnings.length) sourceErrors.push({ sourceId: item.id, reason: [...new Set(warnings)].join(' ') });
      }
      const seriesById = Object.fromEntries(loaded.filter(item => item.snapshot).map(item => [item.id, item.snapshot]));
      const analyzedAt = now();
      const results = analyze(products, seriesById, { asOf: analyzedAt });
      for (const product of products) {
        // Keep transactional comparisons separate from the BOM/index scenario.
        try { results[product.id].references = compareReferences(product, { asOf: analyzedAt }); }
        catch { results[product.id].references = { eligible: [], excluded: [], lowestComparable: null, historical: [],
          error: 'Reference comparison unavailable' }; }
      }
      const summary = { total: Object.keys(results).length, review_price: 0, no_cost_gap: 0, insufficient_evidence: 0 };
      for (const result of Object.values(results)) if (Object.hasOwn(summary, result.status)) summary[result.status]++;
      const pipeline = { inputSourceCount: Object.keys(seriesById).length, configuredSourceCount: sources.length,
        analyzedProductCount: Object.keys(results).length,
        mappedBOMCount: Object.values(results).filter(result => result.bom).length,
        eligibleQuoteCount: Object.values(results).reduce((count, result) => count + (result.references?.eligible?.length || 0), 0),
        excludedQuoteCount: Object.values(results).reduce((count, result) => count + (result.references?.excluded?.length || 0), 0),
      };
      const evidenceVersion = createHash('sha256').update(JSON.stringify(evidence({ products, seriesById, sourceErrors, results }))).digest('hex');
      const modes = new Set(loaded.filter(item => item.snapshot).map(item => item.snapshot.snapshotMode || 'bundled_demo'));
      const snapshotMode = modes.size > 1 ? 'mixed_snapshots' : [...modes][0] || 'bundled_demo';
      latest = { analyzedAt, evidenceVersion, results, summary, sourceErrors, pipeline, snapshotMode };
      lastError = null;
      return latest;
    })().catch(error => { lastError = error; throw error; }).finally(() => { inflight = null; });
    return inflight;
  }

  return {
    start,
    async invalidate() {
      if (inflight) await inflight.catch(() => {});
      latest = null;
      lastError = null;
    },
    async getLatest() {
      if (!latest) await (inflight || start());
      if (lastError) throw new Error('Automatic pricing scan failed');
      return latest;
    },
  };
}
