import test from 'node:test';
import assert from 'node:assert/strict';
import { supplierDraft, negotiationDialog } from '../src/negotiation.js';
import { products } from '../src/data.js';

const part = products.find(p => p.id === 'NF-101');
test('supplier draft uses the selected part, indicative volume and a non-binding opening', () => {
  const draft = supplierDraft(part);
  assert.match(draft, /NF-101/);
  assert.match(draft, /€12\.80/);
  assert.match(draft, /€11\.90/);
  assert.match(draft, /120,000 units/);
  assert.match(draft, /not a purchase commitment/);
});
test('supplier copy does not interpolate internal strategy or price limits', () => {
  const draft = supplierDraft({ ...part, why: 'PRIVATE_COMPETITOR_QUOTE', source: 'PRIVATE_SOURCE', internalLimit: 'PRIVATE_FLOOR', next: 'PRIVATE_STRATEGY', owner: 'PRIVATE_OWNER' });
  assert.doesNotMatch(draft, /PRIVATE_/);
  assert.doesNotMatch(draft, /least acceptable|internal limit/i);
});
test('editable draft is escaped before HTML rendering', () => {
  const html = negotiationDialog({ negotiation: { id: part.id, step: 'draft', draft: '</textarea><script>alert(1)</script>' } });
  assert.ok(html.includes('&lt;/textarea&gt;&lt;script&gt;'));
  assert.ok(!html.includes('<script>'));
});
test('missing and non-opportunity parts cannot generate a negotiation', () => {
  assert.equal(negotiationDialog({ negotiation: { id: 'missing' } }), '');
  assert.equal(negotiationDialog({ negotiation: { id: products.find(p => p.target == null).id } }), '');
});

test('the deck scenario uses one coherent price basis across evidence, targets and copy', () => {
  const hero = products.find(p => p.id === 'TM-105');
  assert.equal(hero.history[0], 20);
  assert.equal(hero.price, 22.4);
  assert.equal(hero.change, 12);
  assert.equal(hero.target, 20.16);
  assert.deepEqual(hero.negotiation, { openingPct: 10, laaPct: 6, indexChange: 3, comparableGap: 8, alternativeGap: 11 });
  const draft = supplierDraft(hero);
  assert.match(draft, /€20\.16/);
  assert.doesNotMatch(draft, /21\.06|LAA|6%|minimum acceptable/);
  const internalPlan = negotiationDialog({ negotiation: { id: hero.id, step: 'plan' } });
  assert.match(internalPlan, /Internal only/);
  assert.match(internalPlan, /€21\.06/);
});
