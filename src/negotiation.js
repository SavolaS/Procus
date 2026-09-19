import { demoProduct, demoProgress, demoEvidence, demoFramework } from './demo-flow.js';
import { evidenceStrip, automaticEvidence } from './evidence.js';
import { rfqContent, rfqDraft } from './rfq.js';
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
  const guided = flow.guided === true && product.id === demoProduct.id;
  const evidence = guided && flow.step === 'evidence';
  const draft = flow.step === 'draft' || flow.step === 'rfq-draft';
  const sourcing = flow.step === 'rfq' || flow.step === 'rfq-draft';
  const reduction = product.negotiation?.openingPct ?? (1 - product.target / product.price) * 100;
  const minimum = product.negotiation?.laaPct;
  const title = evidence ? 'The basis for negotiation' : draft ? sourcing ? 'Review RFQ draft' : 'Review supplier message' : sourcing ? 'Find alternative suppliers' : 'Your negotiation framework';
  const draftText = sourcing ? flow.rfqDraft ?? rfqDraft(product) : flow.draft ?? supplierDraft(product);
  const subject = sourcing ? flow.rfqSubject ?? `Request for quotation · ${product.id} ${product.name}` : flow.subject ?? `Price review · ${product.id} ${product.name}`;
  return `<div class="p-modal-shade" data-close-negotiation="true"></div>
  <section class="p-negotiation" role="dialog" aria-modal="true" aria-labelledby="p-negotiation-title" tabindex="-1">
    <header class="p-negotiation__header"><div><p class="p-eyebrow">${sourcing ? 'RFQ Agent' : 'Negotiation Desk'} · ${sourcing ? 'Optional sourcing' : 'Prepared for buyer review'}</p><h2 id="p-negotiation-title">${title}</h2><p>${esc(product.supplier)} · ${esc(product.id)} · ${esc(product.name)}</p></div><button type="button" class="p-iconbutton" data-close-negotiation="true" aria-label="Close negotiation framework">×</button></header>
    ${guided ? demoProgress(evidence ? 1 : draft ? 3 : 2) : `<ol class="p-steps" aria-label="Preparation progress"><li class="is-complete">1 <span>Price drift detected</span></li><li class="${draft || sourcing ? 'is-complete' : 'is-current'}" ${draft || sourcing ? '' : 'aria-current="step"'}>2 <span>Framework</span></li><li class="${draft || sourcing ? 'is-current' : ''}" ${draft || sourcing ? 'aria-current="step"' : ''}>3 <span>${sourcing ? 'Alternative sourcing' : 'Supplier draft'}</span></li></ol>`}

    <div class="p-negotiation__body">
    ${evidence ? demoEvidence(ui.pricingAnalysis) : guided && !draft && !sourcing ? demoFramework() : draft ? `<div class="p-draft-address"><span>To</span><strong>${sourcing ? 'Alternative supplier · choose after qualification review' : `${esc(product.contact)} · ${esc(product.supplier)}`}</strong><label for="p-message-subject">Subject</label><input id="p-message-subject" value="${esc(subject)}"></div><label class="p-draft-label" for="p-message-body">Message</label><textarea id="p-message-body" spellcheck="true">${esc(draftText)}</textarea><p class="p-panelnote">Editable draft. No email is connected and nothing will be sent.</p>` : sourcing ? rfqContent(product, flow) : `
      ${evidenceStrip(product)}
      <div class="p-plan-metrics"><div><span>Current unit price</span><strong>${price(product.price)}</strong></div><div><span>Illustrative opening · −${reduction.toFixed(0)}%</span><strong>${price(product.target)}</strong></div><div><span>Potential saving at opening</span><strong>${amount(potentialSaving(product))}<small> / year</small></strong></div></div>
      <section class="p-plan-section"><h3>Negotiation position</h3><div class="p-targets"><div><span>Opening ask</span><strong>−${reduction.toFixed(1)}%</strong><p>Request ${price(product.target)} per unit on equivalent terms.</p></div><div class="p-targets__internal"><span>Minimum acceptable reduction (LAA) · Internal only</span><strong>${minimum == null ? 'Not set' : `−${minimum}%`}</strong><p>${minimum == null ? 'Set your internal limit before negotiating.' : `${price(product.price * (1 - minimum / 100))} per unit. Never included in supplier copy.`}</p></div></div><p class="p-plan-source">${minimum == null ? 'The reference price is a starting point for buyer review.' : 'Illustrative buyer targets, not an automatic decision. Confirm your mandate before negotiating.'}</p></section>
      <section class="p-plan-section"><h3>Why negotiate now</h3>${automaticEvidence(product, ui.pricingAnalysis)}${product.signal === 'index' ? '' : `<details class="p-auto-details"><summary>Other demonstration evidence</summary><p>${esc(product.why)}</p><p class="p-plan-source">Illustrative source: ${esc(product.source)}</p></details>`}</section>
      <section class="p-plan-section"><h3>Recommended approach</h3><ol class="p-plan-list"><li><strong>Validate the evidence.</strong> Confirm specifications, volumes, delivered cost and payment terms. A material index explains one cost input, not the full unit price.</li><li><strong>Review the opening proposal of ${price(product.target)}.</strong> This example target is separate from the cost estimate. Confirm your mandate, then request a cost breakdown and updated quotation. You own the supplier relationship.</li><li><strong>Keep an alternative ready.</strong> If terms remain uncompetitive, prepare an RFQ and check qualification, capacity, tooling and lead time before considering a switch.</li></ol></section>
      <details class="p-plan-details"><summary>Sources, assumptions and buyer leverage</summary><p>${count(product.qty)} units a year; potential savings exclude freight, tooling and qualification costs. No savings are agreed or realised by generating this framework.</p><p>Annual volume supports the discussion. Supplier revenue and your share of it are unknown. No replacement is confirmed qualified for this SKU; existing supply continuity remains important.</p>${product.negotiation ? '<p>Internal comparable and alternative percentages are illustrative pitch examples versus the current price; they have not been qualified. Material evidence is evaluated separately above. Buyer targets are illustrative and remain independent of the cost scenario.</p>' : ''}</details>`}
    </div>
    ${guided ? `<footer class="p-negotiation__footer"><p id="p-draft-feedback" role="status">${draft ? 'Nothing sent · LAA stays internal' : evidence ? 'Illustrative evidence · buyer validation needed' : 'Next: prepare the supplier conversation'}</p><div>${draft ? '<button type="button" class="p-button" data-demo-agents="true">Back to Agents</button><button type="button" class="p-button p-button--brand" data-copy-draft="true">Copy draft</button>' : evidence ? '<button type="button" class="p-button" data-demo-overview="true">Back to Overview</button><button type="button" class="p-button p-button--brand" data-demo-plan="true">Build negotiation framework →</button>' : '<button type="button" class="p-button" data-demo-evidence="true">Back to evidence</button><button type="button" class="p-button p-button--brand" data-demo-handoff="true">Continue to Agents →</button>'}</div></footer>` : `<footer class="p-negotiation__footer"><p id="p-draft-feedback" role="status">${draft ? 'You review and lead the conversation' : sourcing ? 'Local demonstration · no suppliers contacted' : 'Your limits stay internal'}</p><div>${draft ? '<button type="button" class="p-button" data-plan-back="true">Back to framework</button><button type="button" class="p-button p-button--brand" data-copy-draft="true">Copy draft</button>' : sourcing ? '<button type="button" class="p-button" data-plan-back="true">Back to framework</button>' : '<button type="button" class="p-button" data-find-alternatives="true">Find alternatives</button><button type="button" class="p-button p-button--brand" data-draft-message="true">Draft supplier message →</button>'}</div></footer>`}
  </section>`;
}
