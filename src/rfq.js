const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);
const price = value => new Intl.NumberFormat('en-IE', {
  style: 'currency', currency: 'EUR', minimumFractionDigits: 2,
  maximumFractionDigits: value < 1 ? 3 : 2,
}).format(value);
const count = value => new Intl.NumberFormat('en-IE').format(value);
const specification = product => product.specification || product.spec || 'Buyer to confirm drawing, revision, material and tolerances';

// An explicit allowlist keeps internal limits and negotiation evidence out of
// the supplier-facing request. This function produces text, not HTML.
export function rfqDraft(product) {
  return `Hello,\n\nPlease provide a quotation for ${product.id} — ${product.name}.\n\nCategory: ${product.category}\nSpecification: ${specification(product)}\nIndicative annual volume: ${count(product.qty)} units. This is for quotation purposes and is not a purchase commitment.\n\nPlease confirm your capability against the drawing, revision, material, tolerances and quality requirements. Identify any deviations and the samples, certificates or other checks required for supplier and part qualification. The buyer will confirm the specification before a formal request is issued.\n\nPlease include:\n- Unit price, currency, price breaks and quotation validity.\n- Lead time, capacity, minimum order quantity and delivery terms.\n- Tooling, setup, sample, freight and other additional costs, listed separately.\n- Payment terms and any commercial conditions.\n\nWe will review comparability and qualification before approving any supplier or placing an order.\n\nBest regards,\nAlex Kim`;
}

export function rfqContent(product, flow = {}) {
  const complete = flow.rfqComplete === true;
  const example = product.id === 'TM-105';
  const candidates = complete && example ? `
    <section class="p-plan-section"><h3>Illustrative alternatives</h3>
      <ul class="p-rfq-candidates">
        <li><strong>Baltic Castings AB</strong>
          <p>Simulated quote: ${escapeHtml(price(product.price * 0.89))} per unit · 11% below the current unit price.</p>
          <p class="p-plan-source">Illustrative casting match. Confirm specification, qualification, tooling, freight and terms before treating this as a comparable offer.</p></li>
        <li><strong>Nordic Precision Castings</strong>
          <p>No quote · qualification pending.</p>
          <p class="p-plan-source">Illustrative candidate only. Capability, capacity and specification fit still require buyer review.</p></li>
      </ul>
    </section>` : complete ? `
    <section class="p-plan-section"><h3>RFQ preparation ready</h3>
      <p>No alternative suppliers or quotes are available for this part in the demo. Prepare the request, then choose and qualify suppliers before contacting them.</p>
    </section>` : '';

  return `<p class="p-plan-source">Supplier discovery preparation · no suppliers contacted yet</p>
    <section class="p-plan-section"><h3>Selected part</h3>
      <dl class="p-pairs">
        <div><dt>Part</dt><dd>${escapeHtml(product.id)} · ${escapeHtml(product.name)}</dd></div>
        <div><dt>Category</dt><dd>${escapeHtml(product.category)}</dd></div>
        <div><dt>Specification</dt><dd>${escapeHtml(specification(product))}</dd></div>
        <div><dt>Annual volume</dt><dd>${escapeHtml(count(product.qty))} units · indicative</dd></div>
        <div><dt>Current unit price</dt><dd>${escapeHtml(price(product.price))}</dd></div>
      </dl>
    </section>
    <section class="p-plan-section"><h3>Matching requirements</h3>
      <ul class="p-plan-list">
        <li>Match drawing, revision, material, dimensions, tolerances and quality requirements.</li>
        <li>Confirm capacity, lead time, minimum order quantity and supplier qualification.</li>
        <li>Compare currency, volume, delivery and payment terms; separate tooling, freight and qualification costs.</li>
      </ul>
    </section>
    ${candidates}
    <section class="p-plan-section">
      <p class="p-plan-source">Open supplier discovery to review your requirements, find candidates and prepare an RFQ. Searches and drafts are saved by the backend. Demo mode simulates supplier research and email; live mode uses configured connections. Review the full request and contact before approving any email.</p>
      ${complete
        ? '<button type="button" class="p-button p-button--brand" data-rfq-draft="true">Prepare RFQ draft</button>'
        : '<button type="button" class="p-button p-button--brand" data-run-rfq="true">Open supplier discovery</button>'}
    </section>`;
}
