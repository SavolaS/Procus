import { products } from './data.js';
import { potentialSaving } from './model.js';

const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const price = value => new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: value < 1 ? 3 : 2 }).format(value);
const amount = value => new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
const count = value => new Intl.NumberFormat('en-IE').format(value);

// Supplier-facing copy is constructed separately from the internal evidence/plan.
// No internal limits, alternative suppliers or private strategy are interpolated.
export function supplierDraft(product) {
  return `Hi ${product.contact},\n\nI'd like to review the pricing for ${product.id} — ${product.name}. Our current unit price is ${price(product.price)}.\n\nCould you provide an updated quotation at ${price(product.target)} per unit, based on an indicative annual volume of ${count(product.qty)} units and the existing specification and delivery terms? Please include the cost breakdown supporting your quotation, its validity, lead time and any conditions.\n\nThe volume is for quotation purposes and is not a purchase commitment. We will review the full commercial terms before confirming an agreement.\n\nBest regards,\nAlex Kim`;
}

export function negotiationDialog(ui) {
  const flow = ui.negotiation;
  if (!flow) return '';
  const product = products.find(p => p.id === flow.id);
  if (!product || product.target == null) return '';
  const draft = flow.step === 'draft';
  const reduction = (1 - product.target / product.price) * 100;
  return `<div class="p-modal-shade" data-close-negotiation="true"></div>
  <section class="p-negotiation" role="dialog" aria-modal="true" aria-labelledby="p-negotiation-title" tabindex="-1">
    <header class="p-negotiation__header"><div><p class="p-eyebrow">Negotiation Desk · Demo</p><h2 id="p-negotiation-title">${draft ? 'Review supplier message' : 'Your negotiation plan'}</h2><p>${esc(product.supplier)} · ${esc(product.id)} · ${esc(product.name)}</p></div><button type="button" class="p-iconbutton" data-close-negotiation="true" aria-label="Close negotiation plan">×</button></header>
    <ol class="p-steps" aria-label="Preparation progress"><li class="is-complete">1 <span>Signal reviewed</span></li><li class="${draft ? 'is-complete' : 'is-current'}" ${draft ? '' : 'aria-current="step"'}>2 <span>Negotiation plan</span></li><li class="${draft ? 'is-current' : ''}" ${draft ? 'aria-current="step"' : ''}>3 <span>Supplier draft</span></li></ol>
    <div class="p-negotiation__body">
    ${draft ? `<div class="p-draft-address"><span>To</span><strong>${esc(product.contact)} · ${esc(product.supplier)}</strong><span>Subject</span><strong>Price review · ${esc(product.id)} ${esc(product.name)}</strong></div><label class="p-draft-label" for="p-message-body">Message</label><textarea id="p-message-body" spellcheck="true">${esc(flow.draft ?? supplierDraft(product))}</textarea><p class="p-panelnote">Editable draft. No email is connected and nothing will be sent.</p>` : `
      <div class="p-plan-metrics"><div><span>Current unit price</span><strong>${price(product.price)}</strong></div><div><span>Proposed opening price</span><strong>${price(product.target)}</strong></div><div><span>Potential annual saving</span><strong>${amount(potentialSaving(product))}</strong></div></div>
      <section class="p-plan-section"><h3>Why this needs a review</h3><p>${esc(product.why)}</p><p class="p-plan-source">Source: ${esc(product.source)} · sample data</p></section>
      <section class="p-plan-section"><h3>Proposed approach</h3><ol class="p-plan-list"><li><strong>Validate the change.</strong> Request a cost breakdown and confirm the drawing, volume, delivery and payment terms are comparable.</li><li><strong>Open at ${price(product.target)} per unit.</strong> A ${reduction.toFixed(1)}% reduction from the current price, using the reference in this example.</li><li><strong>Agree the terms, then verify.</strong> Review the supplier response, effective date and any conditions. Confirm the reduction on invoices before counting realised savings.</li></ol></section>
      <section class="p-plan-section p-plan-assumptions"><h3>Before you negotiate</h3><p>Based on ${count(product.qty)} units a year. Freight, tooling and qualification costs are excluded. This reference is a proposed opening, not an approved internal limit or supplier agreement.</p></section>`}
    </div>
    <footer class="p-negotiation__footer"><p id="p-draft-feedback" role="status">${draft ? 'Prepared for your review' : 'Plan generated from the selected part’s evidence'}</p><div>${draft ? '<button type="button" class="p-button" data-plan-back="true">Back to plan</button><button type="button" class="p-button p-button--brand" data-copy-draft="true">Copy draft</button>' : '<button type="button" class="p-button" data-close-negotiation="true">Close</button><button type="button" class="p-button p-button--brand" data-draft-message="true">Draft supplier message →</button>'}</div></footer>
  </section>`;
}
