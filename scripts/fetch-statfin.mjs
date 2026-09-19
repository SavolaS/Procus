import { mkdir, writeFile, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { statfinEndpoint, statfinDimensions, buildStatfinQuery, parseStatfinMaterials } from '../src/index-sources.js';

async function fetchText(options) {
  const response = await fetch(statfinEndpoint, { ...options, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`StatFin returned HTTP ${response.status}; existing snapshots were not changed`);
  return response.text();
}

const metadataRaw = await fetchText();
const metadata = JSON.parse(metadataRaw);
const periods = metadata.variables?.find(variable => variable.code === statfinDimensions.time)?.values
  ?.filter(period => /^\d{4}M(0[1-9]|1[0-2])$/.test(period) && period >= '2025M01');
const query = buildStatfinQuery(periods);
const raw = await fetchText({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(query) });
const retrievedAt = new Date().toISOString();
const series = parseStatfinMaterials(JSON.parse(raw), retrievedAt);
const rawSha256 = createHash('sha256').update(raw).digest('hex');
const metadataSha256 = createHash('sha256').update(metadataRaw).digest('hex');
const folder = new URL('../research/data/', import.meta.url);
await mkdir(folder, { recursive: true });
async function writeImmutable(filename, content) {
  try { await writeFile(new URL(filename, folder), content, { flag: 'wx' }); }
  catch (error) { if (error.code !== 'EEXIST') throw error; }
}
await writeImmutable(`statfin-${rawSha256}.json`, raw);
await writeImmutable(`statfin-metadata-${metadataSha256}.json`, metadataRaw);
const snapshots = series.map(snapshot => ({ ...snapshot, rawSha256, metadataSha256, sourceQuery: query }));
// Keep the parsed vintage and query beside immutable raw responses before updating the latest aliases.
await writeImmutable(`statfin-vintage-${rawSha256}.json`, `${JSON.stringify({ retrievedAt, series: snapshots }, null, 2)}\n`);
for (const snapshot of snapshots) {
  const filename = `statfin-fi-${snapshot.key}.json`;
  const temporary = new URL(`${filename}.tmp`, folder);
  await writeFile(temporary, `${JSON.stringify(snapshot, null, 2)}\n`);
  await rename(temporary, new URL(filename, folder));
  const latest = snapshot.observations.filter(row => row.value !== null).at(-1);
  console.log(`${filename}: ${latest.period}, index ${latest.value}; ${snapshot.observations.length} months. Domestic PPI proxy, not EUR/kg.`);
}
console.log(`Retrieved: ${retrievedAt}\nRaw SHA-256: ${rawSha256}\nNo BOM mapping was created.`);
