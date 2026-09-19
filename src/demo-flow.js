import { products } from './data.js';
import { potentialSaving } from './model.js';
import { evidenceStrip, automaticEvidence } from './evidence.js';

export const demoProduct = products.find(product => product.id === 'TM-105');
const price = value => new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(value);
const amount = value => new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);

export function demoProgress(current) {
  return `<ol class="p-steps p-demo-steps" aria-label="Negotiation workflow">${['Overview', 'Evidence', 'Framework', 'Agents'].map((label, index) => `<li class="${index < current ? 'is-complete' : index === current ? 'is-current' : ''}"${index === current ? ' aria-current="step"' : ''}><b>${index < current ? '✓' : index + 1}</b><span>${label}</span></li>`).join('')}</ol>`;
}

export function demoOpportunity() {
  const p = demoProduct;
  return `<section class="p-demo-opportunity" aria-labelledby="p-demo-title">
    <div class="p-demo-opportunity__main"><p class="p-eyebrow">Recommended action <span>· Illustrative demo case</span></p>
      <h2 id="p-demo-title">A 12% price increase. A reason to negotiate.</h2>
      <p class="p-demo-part">${p.name} <span>TM-105 · ${p.supplier}</span></p>
      <p>Your unit price rose from ${price(p.history[0])} to ${price(p.price)}. Review the comparisons, set your negotiating position, and prepare the supplier conversation.</p>
      <button type="button" class="p-button p-button--brand" data-demo-start="true">Review negotiation basis <span aria-hidden="true">→</span></button>
    </div>
    <div class="p-demo-opportunity__impact"><span>Potential at the proposed opening</span><strong>${amount(potentialSaving(p))}<small> / year</small></strong><p>10% price reduction · 26,000 units<br>Subject to equivalent terms; not agreed savings.</p></div>
    ${demoProgress(0)}
  </section>`;
}

export function demoEvidence(analysis) {
  const p = demoProduct;
  return `${evidenceStrip(p)}
    <section class="p-demo-reason"><p class="p-eyebrow">The negotiation basis</p><h3>The price has moved. The comparisons justify a review.</h3><p>The 12% increase is a starting point for a supplier discussion. The lower comparable prices strengthen the case for requesting a fresh quotation, subject to matching specifications and commercial terms.</p></section>
    <div class="p-demo-evidence-list">
      <section><span>01</span><div><h3>Purchase price · ${price(p.history[0])} → ${price(p.price)}</h3><p>Same demo part over 12 months. At 26,000 units, the increase adds ${amount((p.price - p.history[0]) * p.qty)} to annual spend versus the old price.</p><small>Source: illustrative purchasing history · TM-105</small></div></section>
      <section><span>02</span><div><h3>Internal comparable · ${price(p.price * (1 - p.negotiation.comparableGap / 100))} / unit</h3><p>8% below the current price. Check revision, volume tier, freight and payment terms before using it as a like-for-like comparison.</p><small>Source: founder pitch example · unverified comparable</small></div></section>
      <section><span>03</span><div><h3>Indicative alternative · ${price(p.price * (1 - p.negotiation.alternativeGap / 100))} / unit</h3><p>11% below the current price. Confirm quote validity, tooling, capacity and part approval before treating this supplier as a usable alternative.</p><small>Source: founder pitch example · supplier not qualified for this part</small></div></section>
    </div>
    <details class="p-demo-cost"><summary>Material context and automatic cost evidence</summary><p>The pitch uses an aluminium index increase of 3%. It is illustrative, and an index alone does not explain the full part price. A verified aluminium BOM and applicable index mapping are still missing.</p>${automaticEvidence(p, analysis)}</details>
    <p class="p-plan-source">These comparisons support preparing a negotiation, not a proven entitlement to a discount. The next step proposes buyer targets for review.</p>`;
}

export function demoFramework() {
  const p = demoProduct;
  return `<section class="p-demo-reason"><p class="p-eyebrow">Your proposed position</p><h3>Open at 10%. Keep 6% as your internal minimum.</h3><p>The opening sits between the illustrative internal comparable (−8%) and alternative quote (−11%). The LAA is a buyer-set limit, not a number derived from the material index.</p></section>
    <div class="p-targets p-demo-targets"><div><span>Opening ask · supplier-facing</span><strong>−${p.negotiation.openingPct}% <small>${price(p.target)} / unit</small></strong><p>Start the discussion here. Request equivalent specifications, volume and delivery terms.</p></div><div class="p-targets__internal"><span>Least acceptable agreement (LAA) · Internal only</span><strong>−${p.negotiation.laaPct}% <small>${price(p.price * (1 - p.negotiation.laaPct / 100))} / unit</small></strong><p>Minimum acceptable reduction. Above this unit price, return to the buyer before proceeding.</p></div></div>
    <div class="p-demo-value"><span>Potential annual saving at opening</span><strong>${amount(potentialSaving(p))}</strong><p>(${price(p.price)} − ${price(p.target)}) × 26,000 units. Before any additional freight, tooling or qualification costs; nothing agreed or realised.</p></div>
    <section class="p-plan-section"><h3>How to lead the negotiation</h3><ol class="p-plan-list"><li><strong>Challenge the increase with evidence.</strong> Ask what changed in the cost breakdown. Validate the internal comparable and alternative quote before presenting them as equivalent.</li><li><strong>Open at ${price(p.target)} per unit.</strong> Use annual volume to support a review, without making a purchase commitment.</li><li><strong>Hold the internal boundary.</strong> If the response is above ${price(p.price * (1 - p.negotiation.laaPct / 100))} or changes key terms, escalate to the buyer and consider an alternative RFQ.</li></ol></section>
    <p class="p-plan-source">Illustrative buyer targets for the demo. Continuing prepares an internal agent brief; it does not approve a purchase or contact a supplier.</p>`;
}

export function demoAgentCase(ui) {
  if (ui.demoCase?.id !== demoProduct.id) return '';
  const p = demoProduct;
  return `<section class="p-demo-agent" id="p-demo-agent" tabindex="-1" aria-labelledby="p-demo-agent-title">
    ${demoProgress(3)}
    <div class="p-demo-agent__body"><div class="p-demo-agent__heading"><div><p class="p-eyebrow">Negotiation Desk · Illustrative demo</p><h2 id="p-demo-agent-title">${ui.demoCase.prepared ? 'Supplier draft ready for your review' : 'Your negotiation brief is ready'}</h2><p>${p.id} · ${p.name} · ${p.supplier}</p></div><span class="p-badge p-badge--${ui.demoCase.prepared ? 'success' : 'watch'}">${ui.demoCase.prepared ? 'Draft prepared' : 'Ready to prepare'}</span></div>
    <div class="p-demo-agent__grid"><div><h3>What the agent will prepare</h3><p>Request ${price(p.target)} per unit on the existing specification and delivery terms, using 26,000 units as indicative annual volume. Ask for a cost breakdown, quote validity and lead time.</p><ol class="p-demo-checks"><li>Price history and comparison caveats carried over</li><li>Opening ask included in supplier draft</li><li>LAA retained in the internal brief only</li></ol></div>
      <aside class="p-demo-mandate"><p class="p-eyebrow">Internal negotiation brief</p><dl><div><dt>Opening ask · −10%</dt><dd>${price(p.target)}</dd></div><div><dt>LAA · minimum reduction 6%</dt><dd>${price(p.price * (1 - p.negotiation.laaPct / 100))}</dd></div></dl><p>If the supplier cannot reach the LAA on equivalent terms, return to the buyer. No automatic acceptance.</p></aside></div>
    <div class="p-demo-agent__actions"><div class="p-demo-agent__note"><p role="status">${ui.demoCase.prepared ? 'Draft prepared locally. Review it before using it.' : 'Local demo preparation. No supplier has been contacted.'}</p><button class="p-link" data-demo-restart="true">Restart demo</button></div><div><button class="p-button" data-demo-framework="true">Review framework</button><button class="p-button p-button--brand" data-demo-prepare="true">${ui.demoCase.prepared ? 'Review supplier draft' : 'Prepare supplier draft'} →</button></div></div></div>
  </section>`;
}
