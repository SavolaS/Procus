// Demonstration manufacturing assumptions, not customer BOMs or supplier quotations.
// Independent material quantities and baseline EUR/kg rates establish cost exposure;
// existing negotiation targets and savings fields are deliberately not inputs.
export const bomPeriods = Object.freeze({ baseline: '2025-10', current: '2026-09' });

const steelSeries = 'STATFIN:13m8:241.2.thi-pisteluku21';
const copperSeries = 'STATFIN:13m8:2444.2.thi-pisteluku21';
const passThrough = Object.freeze({ low: 0.5, central: 0.75, high: 1 });

function record(productId, material, unit, netMassKg, yieldRate, pricePerKg, seriesId, mappingReason) {
  return Object.freeze({
    productId, revision: 'DEMO-BOM-2025-10-A', material, unit, netMassKg, yieldRate, pricePerKg,
    recoveryRate: 0, scrapPricePerKg: 0, currency: 'EUR', seriesId,
    lagMonths: 2, windowMonths: 1, passThrough, mappingReason,
    source: 'Prototype assumption — illustrative quantities and Oct 2025 EUR/kg rates; not a supplier BOM or quote.',
    reviewStatus: 'prototype_assumption',
    assumptions: Object.freeze([
      'BOM quantities, baseline material rates and unchanged specification, batch and delivery terms are illustrative.',
      'The two-month procurement lag and 50–100% material pass-through are unvalidated scenario assumptions.',
      'No scrap recovery credit is assumed; conversion, labor, overhead, freight and margin remain at their baseline amounts.',
      'The Finnish domestic producer-price series is a product-group proxy, not a grade-specific raw-material quote.',
    ]),
  });
}

export const bomByProductId = Object.freeze({
  'NF-101': record('NF-101', 'Carbon steel plate', 'piece', 3.8, 0.95, 1.45, steelSeries,
    'Prototype carbon-steel plate mapped to Finnish basic iron and steel producer prices; exact grade and stock-form premium are unverified.'),
  'NF-118': record('NF-118', 'Carbon steel sheet', 'piece', 0.32, 0.8, 1.6, steelSeries,
    'Prototype laser-cut steel bracket mapped only for its purchased steel input; cutting and finishing costs stay fixed.'),
  'NF-355': record('NF-355', 'Carbon steel tube', 'piece', 3.4, 0.95, 1.55, steelSeries,
    'Prototype steel-tube feedstock mapped to basic iron and steel; tube-forming premium and exact grade are unverified.'),
  'LE-064': record('LE-064', 'Copper conductor', 'metre', 0.0672, 0.96, 9, copperSeries,
    'Prototype copper conductor content per metre mapped to Finnish copper producer prices; insulation and cable conversion stay fixed.'),
});
