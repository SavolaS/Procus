import { indexComparisonChart } from './index-chart.js';

// Shared display of the pitch example; different comparison bases stay explicit.
const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
export function evidenceStrip(product) {
  const n = product.negotiation;
  if (!n) return '';
  const rows = [
    ['Your unit price', `+${product.change}%`, '12-month change', 'price'],
    ['Aluminium index', `+${n.indexChange}%`, 'Pitch example · same 12 months', 'index'],
    ['Internal comparable', `−${n.comparableGap}%`, 'Pitch example · unverified', 'comparable'],
    ['Alternative quote', `−${n.alternativeGap}%`, 'Pitch example · not qualified', 'alternative'],
  ];
  return `<dl class="p-evidence-strip" aria-label="Price comparison evidence">${rows.map(([label,value,basis,kind]) => `<div data-evidence="${kind}"><dt>${esc(label)}</dt><dd>${esc(value)}</dd><small>${esc(basis)}</small></div>`).join('')}</dl>`;
}

const money = value => Number.isFinite(value) ? new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(value) : 'Not available';
const sourceMoney = (value, currency) => Number.isFinite(value) ? `${value.toFixed(2)} ${esc(currency || 'currency not recorded')}` : 'Not available';
const textValue = value => typeof value === 'string' ? value : JSON.stringify(value ?? 'Not reported');
const safeLink = url => {
  try { return new URL(url).protocol === 'https:' ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Source query</a>` : 'Source link unavailable'; }
  catch { return 'Source link unavailable'; }
};

export function portfolioCoverage(products, analysis) {
  if (!analysis || analysis.status === 'loading') return 'Checking cost evidence across the portfolio…';
  if (analysis.status === 'error') return 'Cost evidence unavailable';
  const counts = { review_price: 0, no_cost_gap: 0, insufficient_evidence: 0 };
  for (const product of products) {
    const status = analysis.results?.[product.id]?.status;
    counts[Object.hasOwn(counts, status) ? status : 'insufficient_evidence']++;
  }
  return `${counts.review_price} cost reviews · ${counts.no_cost_gap} no model gap · ${counts.insufficient_evidence} need data`;
}

export function costReason(product, analysis) {
  if (!analysis || analysis.status === 'loading') return 'Checking cost evidence';
  if (analysis.status === 'error') return 'Cost evidence unavailable';
  const result = analysis.results?.[product.id];
  if (result?.status === 'review_price') return Number.isFinite(result.priceGap?.low)
    ? `${money(result.priceGap.low)} above upper cost estimate` : 'Cost evidence supports review';
  if (result?.status === 'no_cost_gap') return 'No gap supported by cost model';
  return 'BOM or source evidence needed';
}

function comparisonEvidence(references) {
  if (!references) return '<p>No qualified supplier-price comparison is available.</p>';
  const source = row => `<p>Source: ${esc(row.source?.label || 'Illustrative procurement record')} · ${esc(row.source?.documentId || 'document not recorded')} · ${esc(row.source?.locator || 'location not recorded')}. Captured ${esc(row.source?.capturedAt || 'time not recorded')}.</p>`;
  const eligible = Array.isArray(references.eligible) ? references.eligible : [];
  const excluded = Array.isArray(references.excluded) ? references.excluded : [];
  const historical = Array.isArray(references.historical) ? references.historical : [];
  const basis = row => {
    const context = row.comparisonBasis;
    if (!context || typeof context !== 'object') return context === 'delivered_recurring_unit_cost'
      ? 'Recurring delivered cost per unit, excluding VAT' : esc(textValue(context));
    return `${esc(context.specificationId)} revision ${esc(context.revision)} · ${esc(context.orderQuantity)} ${esc(context.unit)} · ${esc(context.incoterm)} to ${esc(context.destinationSite)} · payment ${esc(context.paymentTerms)} · required by ${esc(context.requiredDeliveryDate)} · excluding VAT`;
  };
  return `<section class="p-auto-comparisons"><h4>Comparable supplier prices</h4><p>Illustrative quote records, checked against the requested purchasing basis. Kept separate from the BOM cost scenario.</p>
    ${eligible.length ? eligible.map(row => `<div class="p-auto-source"><p><strong>${esc(row.supplierName)}</strong>: ${money(row.landedUnitPrice)} / ${esc(row.unit)} delivered at ${esc(row.orderQuantity)} units. Valid through ${esc(row.validUntil)}.</p>
      ${row.priceBasis && Number.isFinite(row.normalizedUnitPrice) ? `<p>Price conversion: ${sourceMoney(row.priceBasis.amount, row.priceBasis.currency)} ÷ ${esc(row.priceBasis.unitsPerPrice)} ${esc(row.priceBasis.unit)}${row.priceBasis.conversion ? ` × ${esc(row.priceBasis.conversion.rateEuroPerCurrencyUnit)} EUR/${esc(row.priceBasis.currency)} (rate dated ${esc(row.priceBasis.conversion.rateDate)})` : ''} = ${money(row.normalizedUnitPrice)} / ${esc(row.unit)}.
        ${row.charges ? `Freight ${money(row.charges.freightPerUnit)} + packaging ${money(row.charges.packagingPerUnit)} + duty ${money(row.charges.dutyPerUnit)} + other recurring charges ${money(row.charges.otherRecurringPerUnit)} per unit.` : ''}</p>` : ''}
      <p>Comparison basis: ${basis(row)}.</p>
      ${row.delivery ? `<p>Delivery confirmed by ${esc(row.delivery.confirmedBy)}; ${esc(row.delivery.availableQuantity)} units available.</p>${source(row.delivery)}` : ''}
      ${row.priceBasis?.conversion ? `<p>Currency conversion evidence:</p>${source(row.priceBasis.conversion)}` : ''}
      ${source(row)}</div>`).join('') : '<p>No eligible current quotation.</p>'}
    ${excluded.length ? `<h4>Excluded from current comparison</h4>${excluded.map(row => `<div class="p-auto-source"><p>${esc(row.supplierName || row.id)}: ${esc((row.reasons || row.reasonCodes || []).join('; '))}.</p>${source(row)}</div>`).join('')}` : ''}
    ${historical.length ? `<h4>Historical context only</h4>${historical.map(row => `<div class="p-auto-source"><p>${esc(row.supplierName)}: ${money(row.landedUnitPrice)} / ${esc(row.unit)}; observed ${esc(row.observedOn)}. This is not a current offer.</p>${source(row)}</div>`).join('')}` : ''}
    <p>Recurring delivered prices exclude VAT, one-off tooling, qualification and switching costs. A comparable quote supports a purchasing discussion; it is not net savings and does not change the opening ask.</p></section>`;
}

export function automaticEvidenceContent(product, analysis, compact = false) {
  if (!analysis || analysis.status === 'loading') return '<p class="p-auto-status" role="status">Checking BOM and index evidence automatically…</p>';
  if (analysis.status === 'error') return `<p class="p-auto-status" role="status">Cost analysis unavailable. ${esc(analysis.error || 'The bundled evidence could not be loaded.')}</p><button type="button" class="p-link" data-retry-analysis>Retry local analysis</button>`;
  const result = analysis.results?.[product.id];
  if (!result) return '<p class="p-auto-status">Material data needed. No cost analysis was returned for this part.</p>';
  const scenario = result.scenario;
  const range = scenario?.range;
  const isScenario = scenario?.status === 'scenario' && range && ['low', 'central', 'high'].every(key => Number.isFinite(range[key]));
  const bom = result.bom;
  const unit = bom?.unit === 'metre' ? 'metre' : 'part';
  const explanation = isScenario
    ? `${result.status === 'review_price' ? `The current price is ${money(result.priceGap.low)} above the upper cost estimate.` : 'The current price does not materially exceed the cost estimate.'} Material inputs account for ${(scenario.indexedCostShare * 100).toFixed(1)}% of the baseline price; the remaining costs stay fixed in this scenario.`
    : 'The available BOM or source evidence does not yet establish a material-cost comparison.';
  return `<div class="p-auto-finding" data-decision="${esc(result.status)}">
    <p class="p-auto-label">Automatic cost analysis · prototype purchasing data</p>
    <h${compact ? '3' : '4'}>${esc(result.headline || 'Material data needed')}</h${compact ? '3' : '4'}>
    ${isScenario ? indexComparisonChart(result) : ''}
    <p>${esc(explanation)}</p>
    ${isScenario ? `<p class="p-auto-range">Cost scenario <strong>${money(range.low)}–${money(range.high)}</strong> / ${unit} · current ${money(product.price)}${Number.isFinite(result.priceGap?.central) ? ` · central gap ${money(result.priceGap.central)}` : ''}</p>` : ''}
    <p><strong>Next step:</strong> ${esc(result.nextStep || 'Request a verified BOM, baseline costs and suitable index mapping.')}</p>
    <details class="p-auto-details"><summary>Sources, BOM coverage and assumptions</summary>
      <p>${esc(result.explanation || '')}</p>
      ${result.issues?.length ? `<ul>${result.issues.map(issue => `<li>${esc(textValue(issue))}</li>`).join('')}</ul>` : ''}
      ${bom ? `<p>BOM ${esc(bom.revision)}: ${esc(bom.material)}. Source: ${esc(bom.source)}.</p>
        <p>Net mass ${esc(bom.netMassKg)} kg / ${unit}; yield ${Number.isFinite(bom.yieldRate) ? (bom.yieldRate * 100).toFixed(1) : 'unknown'}%; baseline material price ${money(bom.pricePerKg)} / kg.
          Gross input ${Number.isFinite(bom.materialCost?.grossMassKg) ? bom.materialCost.grossMassKg.toFixed(3) : 'unknown'} kg; material cost ${money(bom.materialCost?.netCost)} / ${unit}. Scrap proceeds ${money(bom.materialCost?.scrapCredit)}.</p>
        ${Array.isArray(bom.assumptions) ? `<ul>${bom.assumptions.map(item => `<li>${esc(item)}</li>`).join('')}</ul>` : ''}` : '<p>No supported BOM and material mapping are available for this part.</p>'}
      ${isScenario ? `<p>Baseline ${money(scenario.baseline.unitPrice)} (${esc(scenario.baseline.period)}); comparison ${esc(scenario.targetPeriod)}.
        Modelled cost coverage ${(scenario.indexedCostShare * 100).toFixed(1)}%; fixed residual ${money(scenario.fixedResidual)} / ${unit}.</p>
        <p><strong>Calculation bridge:</strong> ${money(scenario.baseline.unitPrice)} baseline ${range.central >= scenario.baseline.unitPrice ? '+' : '−'} ${money(Math.abs(range.central - scenario.baseline.unitPrice))} indexed material movement = ${money(range.central)} central cost scenario. Current purchase price: ${money(product.price)} / ${unit}.</p>
        ${scenario.contributions.map(row => `<div class="p-auto-source"><p>${esc(row.series)} · ${esc(row.geography)} · ${esc(row.unit)}.</p>
          <p>Base: ${esc(row.base.observations.map(obs => `${obs.period}: ${obs.value}`).join(', '))}. Comparison: ${esc(row.target.observations.map(obs => `${obs.period}: ${obs.value}`).join(', '))}.
            Lag ${row.lagMonths} months; averaging window ${row.windowMonths} month(s). Central contribution ${money(row.central)} / ${unit}.</p>
          <p>${esc(row.mappingReason)} Pass-through ${(row.passThrough.low * 100).toFixed(0)}–${(row.passThrough.high * 100).toFixed(0)}%; central ${(row.passThrough.central * 100).toFixed(0)}%.</p>
          <p>Material contribution: ${money(row.baseCost)} exposure × ${(row.passThrough.central * 100).toFixed(0)}% pass-through × (${row.target.value} / ${row.base.value} − 1) = ${money(row.central)} per ${unit}.</p>
          <p>${safeLink(row.sourceUrl)} · retrieved ${esc(row.retrievedAt)}.</p>
          <p>${String(row.series).startsWith('STATFIN:') ? 'Source: Statistics Finland / StatFin. Data licensed under CC BY 4.0. Calculations and assumptions by Procus.' : String(row.series).startsWith('ESTAT:') ? 'Source: Eurostat, sts_inppd_m. Calculations and assumptions by Procus; Eurostat is not responsible for these transformations.' : 'Provider and reuse terms: see the linked source.'}</p></div>`).join('')}` : ''}
      ${comparisonEvidence(result.references)}
      <p>Analysis of bundled evidence · ${esc(analysis.analyzedAt || result.analyzedAt || 'time not reported')}. Source retrieval dates are shown above; no live market data is fetched.</p>
      <p>Illustrative purchase prices, BOM and pass-through assumptions. The range is a cost scenario, not a supplier quotation, contract entitlement or proven saving. Unmodelled costs stay fixed. Targets and savings are not changed by this analysis.</p>
    </details></div>`;
}

export function automaticEvidence(product, analysis, compact = false) {
  return `<div class="p-auto-evidence" data-auto-evidence="${esc(product.id)}" data-compact="${compact}">${automaticEvidenceContent(product, analysis, compact)}</div>`;
}
