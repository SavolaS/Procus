import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { products } from '../src/data.js';
import { analyzePortfolio } from '../src/automatic-pricing.js';
import { automaticEvidenceContent, evidenceStrip, portfolioCoverage, costReason } from '../src/evidence.js';
import { supplierDraft } from '../src/negotiation.js';
import { restoreState } from '../src/model.js';
import { referenceDataByProductId } from '../src/reference-data.js';
import { compareReferenceRows } from '../src/reference-prices.js';
import { indexComparisonChart } from '../src/index-chart.js';

const series = ['steel', 'copper'].map(name => JSON.parse(readFileSync(new URL(`../research/data/statfin-fi-${name}.json`, import.meta.url), 'utf8')));
const analyzedAt = '2026-09-19T23:59:59Z';
const results = analyzePortfolio(products, Object.fromEntries(series.map(row => [row.id, row])), { asOf: analyzedAt });
const state = { status: 'ready', results, analyzedAt };

test('automatic evidence explains calculation basis and credits actual data provider', () => {
  const part = products.find(row => row.id === 'NF-101');
  const html = automaticEvidenceContent(part, state);
  assert.match(html, /Cost scenario/);
  assert.match(html, /Lag 2 months/);
  assert.match(html, /2025-08/);
  assert.match(html, /2026-07/);
  assert.match(html, /Modelled cost coverage/);
  assert.match(html, /Statistics Finland \/ StatFin/);
  assert.doesNotMatch(html, /Source: Eurostat/);
  assert.match(html, /not a supplier quotation, contract entitlement or proven saving/);
  assert.match(html, /Oct 2025 = 100/);
  assert.match(html, /Price paid/);
  assert.match(html, /BOM cost estimate/);
  assert.match(html, /Material index/);
  assert.match(html, /aligned with a 2-month lag/);
});

test('index chart never fills missing trends or invents comparable-price history', () => {
  assert.equal(indexComparisonChart({ trend: [] }), '');
  const result = structuredClone(results['NF-101']);
  assert.doesNotMatch(indexComparisonChart(result), /Comparable part/);
  result.trend[3].materialIndex = null;
  assert.equal(indexComparisonChart(result), '');
  assert.doesNotMatch(indexComparisonChart(results['NF-355']), /p-index-gap|shaded gap/);
});

test('unsupported part and unavailable response never show a numeric cost finding', () => {
  const part = products.find(row => row.id === 'TM-105');
  const html = automaticEvidenceContent(part, state);
  assert.match(html, /More evidence needed/);
  assert.match(html, /No supported BOM/);
  assert.doesNotMatch(html, /p-auto-range|Source: Eurostat|Source: Statistics/);
  assert.match(evidenceStrip(part), /Aluminium index/);
  assert.match(evidenceStrip(part), /\+3%/);
  assert.match(evidenceStrip(part), /Pitch example · same 12 months/);
  assert.doesNotMatch(html, /\+3%/); // Illustrative deck input is never smuggled into the sourced model.
  assert.match(automaticEvidenceContent(part, { status: 'error', error: '<bad>' }), /&lt;bad&gt;/);
  assert.doesNotMatch(automaticEvidenceContent(part, { status: 'error', results }), /p-auto-range/);
});

test('model findings and internal limits never enter supplier copy and obsolete view is rejected', () => {
  const part = products.find(row => row.id === 'TM-105');
  const draft = supplierDraft({ ...part, costAnalysis: { explanation: 'PRIVATE_COST_FINDING' } });
  assert.doesNotMatch(draft, /PRIVATE_COST_FINDING|LAA|21\.06/);
  assert.equal(restoreState({ version: 3, view: 'pricing' }, products, []).view, undefined);
});

test('portfolio coverage counts unsupported parts and does not call no-gap evidence a price alert', () => {
  assert.equal(portfolioCoverage(products, state), '3 cost reviews · 1 no model gap · 45 need data');
  assert.equal(costReason(products.find(row => row.id === 'NF-355'), state), 'No gap supported by cost model');
  assert.match(portfolioCoverage(products, { status: 'error', results }), /unavailable/);
  assert.match(portfolioCoverage(products, { status: 'loading' }), /Checking/);
});

test('supplier comparison records retain exclusion reasons and cannot inject markup', () => {
  const part = products.find(row => row.id === 'NF-101');
  const references = {
    eligible: [{ supplierName: '<script>seller</script>', landedUnitPrice: 11.8, unit: 'piece', orderQuantity: 100,
      validUntil: '2026-10-31', comparisonBasis: '<img src=x onerror=bad>', source: { documentId: '<private-doc>', locator: 'line 4', label: '<svg onload=bad>', capturedAt: '2026-09-18' } }],
    excluded: [{ supplierName: 'Expired', reasons: ['Expired <script>offer</script>'], source: {} }],
    historical: [{ supplierName: 'Earlier seller', landedUnitPrice: 11.6, unit: 'piece', observedOn: '2025-10-01', source: {} }],
  };
  const html = automaticEvidenceContent(part, { ...state, results: { [part.id]: { ...results[part.id], references } } });
  assert.match(html, /€11\.80/);
  assert.match(html, /&lt;script&gt;seller/);
  assert.match(html, /&lt;img src=x onerror=bad&gt;/);
  assert.match(html, /Expired &lt;script&gt;offer/);
  assert.match(html, /&lt;private-doc&gt;/);
  assert.match(html, /This is not a current offer/);
  assert.doesNotMatch(html, /<script>|<svg onload|<img src=x/);
});

test('comparison presentation explains purchasing terms and foreign-currency normalization', () => {
  const part = products.find(row => row.id === 'NF-101');
  const fixture = structuredClone(referenceDataByProductId[part.id]);
  const row = fixture.rows[0];
  row.price = { amount: 120, unitsPerPrice: 10, unit: 'piece', currency: 'USD',
    conversion: { fromCurrency: 'USD', toCurrency: 'EUR', rateEuroPerCurrencyUnit: 0.9,
      rateDate: '2026-09-14', source: { ...row.source, documentId: 'demo-fx-source' } } };
  const references = compareReferenceRows(fixture.context, [row], { asOf: analyzedAt });
  assert.equal(references.eligible.length, 1);
  const html = automaticEvidenceContent(part, { ...state, results: { [part.id]: { ...results[part.id], references } } });
  assert.match(html, /120\.00 USD ÷ 10 piece × 0\.9 EUR\/USD/);
  assert.match(html, /€10\.80 \/ piece/);
  assert.match(html, /demo-fx-source/);
  assert.match(html, /revision A · 2000 piece · DAP to DEMO-TAMPERE-01/);
  assert.match(html, /Delivery confirmed by 2026-10-15; 3000 units available/);
  assert.match(html, /not net savings/);
  assert.doesNotMatch(html, /&quot;specificationId&quot;|€120\.00/);
});
