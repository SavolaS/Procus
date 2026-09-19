import test from 'node:test';
import assert from 'node:assert/strict';
import { demoProduct, demoOpportunity, demoAgentCase } from '../src/demo-flow.js';
import { negotiationDialog, supplierDraft } from '../src/negotiation.js';
import { products, states } from '../src/data.js';
import { computeSpend, persistState, restoreState } from '../src/model.js';

const flow = step => ({ negotiation: { id: demoProduct.id, guided: true, step } });

test('guided evidence keeps unsupported material data separate from illustrative comparisons', () => {
  const html = negotiationDialog({ ...flow('evidence'), pricingAnalysis: { status: 'error', error: 'Offline' } });
  assert.match(html, /€20\.00 → €22\.40/);
  assert.match(html, /€20\.61/);
  assert.match(html, /€19\.94/);
  assert.match(html, /unverified comparable/);
  assert.match(html, /supplier not qualified/);
  assert.match(html, /Cost analysis unavailable/);
  assert.doesNotMatch(html, /p-auto-range/);
  assert.match(html, /data-demo-plan/);
  assert.doesNotMatch(html, /data-demo-handoff/);
});

test('framework and agent brief share targets while the supplier draft excludes LAA', () => {
  for (const html of [negotiationDialog(flow('plan')), demoAgentCase({ demoCase: { id: demoProduct.id } })]) {
    assert.match(html, /€20\.16/);
    assert.match(html, /€21\.06/);
    assert.match(html, /LAA/);
  }
  assert.match(demoOpportunity(), /€58,240/);
  assert.match(negotiationDialog(flow('plan')), /data-demo-handoff/);
  const html = negotiationDialog(flow('draft'));
  const supplierText = html.match(/<textarea[^>]*>([\s\S]*?)<\/textarea>/)[1];
  assert.match(supplierText, /€20\.16/);
  assert.doesNotMatch(supplierText, /21\.06|LAA|6%|Internal|unverified comparable/);
  assert.equal(supplierDraft(demoProduct).includes('not a purchase commitment'), true);
});

test('agent handoff survives reload without changing case stages or savings', () => {
  const statuses = { 'NF-101': 'Negotiating' };
  const baseline = computeSpend(products, statuses);
  let saved;
  persistState({ view: 'agents', statuses, demoCase: { id: demoProduct.id, prepared: true } }, {
    setItem: (_, value) => { saved = JSON.parse(value); },
  });
  const restored = restoreState(saved, products, states);
  assert.deepEqual(restored.demoCase, { id: demoProduct.id, prepared: true });
  assert.deepEqual(restored.statuses, statuses);
  assert.deepEqual(computeSpend(products, restored.statuses), baseline);
  assert.match(demoAgentCase(restored), /Supplier draft ready for your review/);
  assert.equal(demoAgentCase({}), '');
  assert.equal(restoreState({ version: 3, demoCase: { id: 'missing', prepared: true } }, products, states).demoCase, undefined);
  assert.equal(restoreState({ version: 3, demoCase: { id: demoProduct.id, prepared: 'yes' } }, products, states).demoCase.prepared, false);
});
