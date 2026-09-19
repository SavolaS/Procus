import { mkdir, writeFile, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { eurostatMetals, parseEurostatMetals } from '../src/index-sources.js';

const response = await fetch(eurostatMetals.sourceUrl, { signal: AbortSignal.timeout(30000) });
if (!response.ok) throw new Error(`Eurostat returned HTTP ${response.status}; existing snapshot was not changed`);
const raw = await response.text();
const retrievedAt = new Date().toISOString();
const snapshot = parseEurostatMetals(JSON.parse(raw), retrievedAt);
snapshot.rawSha256 = createHash('sha256').update(raw).digest('hex');
const folder = new URL('../research/data/', import.meta.url);
await mkdir(folder, { recursive: true });
// Preserve provider response by content hash so later revisions do not erase evidence.
async function writeImmutable(filename, content) {
  try { await writeFile(new URL(filename, folder), content, { flag: 'wx' }); }
  catch (error) { if (error.code !== 'EEXIST') throw error; }
}
await writeImmutable(`eurostat-${snapshot.rawSha256}.json`, raw);
await writeImmutable(`eurostat-vintage-${snapshot.rawSha256}.json`, `${JSON.stringify(snapshot, null, 2)}\n`);
const file = new URL('eurostat-fi-basic-metals.json', folder);
const temporary = new URL('eurostat-fi-basic-metals.json.tmp', folder);
await writeFile(temporary, `${JSON.stringify(snapshot, null, 2)}\n`);
await rename(temporary, file);
const latest = snapshot.observations.filter(row => row.value !== null).at(-1);
console.log(`Saved ${snapshot.id}\nLatest observed month: ${latest.period}, index ${latest.value}\nRetrieved: ${retrievedAt}\nMissing periods remain null. This is a broad producer-price proxy.`);
