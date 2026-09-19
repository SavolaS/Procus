import test from 'node:test';
import assert from 'node:assert/strict';
import { rfqContent, rfqDraft } from '../src/rfq.js';

const part = {
  id: 'TM-105', name: 'Aluminium housing', category: 'Castings',
  qty: 26000, price: 22, specification: 'Drawing AH-2, revision C',
};

test('RFQ results require the explicit local completion state', () => {
  const initial = rfqContent(part);
  assert.match(initial, /data-run-rfq="true"/);
  assert.match(initial, /no suppliers contacted/);
  assert.doesNotMatch(initial, /Baltic Castings|Nordic Precision|Simulated quote/);
  const complete = rfqContent(part, { rfqComplete: true });
  assert.match(complete, /Baltic Castings AB/);
  assert.match(complete, /€19\.58/);
  assert.match(complete, /11% below/);
  assert.match(complete, /Nordic Precision Castings/);
  assert.match(complete, /No quote · qualification pending/);
  assert.match(complete, /data-rfq-draft="true"/);
  assert.doesNotMatch(complete, /data-run-rfq/);
});

test('other parts receive preparation only, never fabricated alternatives or quotes', () => {
  const html = rfqContent({ ...part, id: 'NF-101' }, { rfqComplete: true });
  assert.match(html, /No alternative suppliers or quotes are available/);
  assert.doesNotMatch(html, /Baltic Castings|Nordic Precision|Simulated quote|11% below/);
  assert.match(html, /data-rfq-draft="true"/);
});

test('supplier RFQ draft uses commercial requirements without private negotiation fields', () => {
  const draft = rfqDraft({
    ...part,
    internalLAA: 'PRIVATE_LAA_SENTINEL', strategy: 'PRIVATE_STRATEGY_SENTINEL',
    priceFloor: 'PRIVATE_FLOOR_SENTINEL', alternativeQuote: 'PRIVATE_QUOTE_SENTINEL',
    target: 'PRIVATE_TARGET_SENTINEL', why: 'PRIVATE_EVIDENCE_SENTINEL',
  });
  assert.doesNotMatch(draft, /PRIVATE_|Baltic Castings|Nordic Precision|11%|LAA|price floor/i);
  for (const detail of [part.id, part.name, part.category, part.specification, '26,000']) {
    assert.ok(draft.includes(detail));
  }
  assert.match(draft, /not a purchase commitment/);
  assert.match(draft, /Lead time/);
  assert.match(draft, /Tooling/);
  assert.match(draft, /Payment terms/);
  assert.match(draft, /qualification/);
});

test('RFQ HTML escapes source strings including specifications', () => {
  const html = rfqContent({
    ...part, id: '<svg onload="alert(1)">', name: '<img src=x onerror="boom">',
    category: 'Castings & "parts"', specification: "<script>bad()</script> 'rev'",
  });
  assert.doesNotMatch(html, /<svg|<img|<script/);
  assert.match(html, /&lt;svg onload=&quot;alert\(1\)&quot;&gt;/);
  assert.match(html, /Castings &amp; &quot;parts&quot;/);
  assert.match(html, /&lt;script&gt;bad\(\)&lt;\/script&gt; &#39;rev&#39;/);
});

test('missing specification is acknowledged rather than invented', () => {
  const product = { ...part, specification: undefined };
  assert.match(rfqContent(product), /Buyer to confirm drawing, revision, material and tolerances/);
  assert.match(rfqDraft(product), /Buyer to confirm drawing, revision, material and tolerances/);
});
