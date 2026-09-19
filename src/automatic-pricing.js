import { bomMaterialCost, repriceBom } from './pricing.js';
import { bomByProductId, bomPeriods } from './bom-data.js';

const positive = value => typeof value === 'number' && Number.isFinite(value) && value > 0;
const money = value => `€${value.toFixed(2)}`;
const percent = value => `${value >= 0 ? '+' : ''}${(value * 100).toFixed(1)}%`;
const dataMode = 'demo_bom_real_indices';

function insufficient(asOf, bom, issues, explanation, nextStep) {
  return { status: 'insufficient_evidence', headline: 'More evidence needed', explanation, nextStep, issues,
    scenario: null, priceGap: null, analyzedAt: asOf, dataMode, bom, threshold: null, trend: [] };
}

function monthlyTrend(history, scenarioInput) {
  if (!Array.isArray(history) || history.length !== 12 || !history.every(positive)) return [];
  const [year, month] = bomPeriods.baseline.split('-').map(Number);
  const baselinePrice = scenarioInput.baseline.unitPrice;
  const rows = [];
  for (let index = 0; index < history.length; index++) {
    const period = new Date(Date.UTC(year, month - 1 + index, 1)).toISOString().slice(0, 7);
    const scenario = repriceBom({ ...scenarioInput, targetPeriod: period });
    if (scenario.status !== 'scenario') return [];
    const row = { period, pricePaidIndex: history[index] / baselinePrice * 100,
      materialIndex: scenario.contributions[0].ratio * 100,
      costScenarioIndex: scenario.range.central / baselinePrice * 100,
      costLowIndex: scenario.range.low / baselinePrice * 100,
      costHighIndex: scenario.range.high / baselinePrice * 100 };
    if (!Object.entries(row).every(([key, value]) => key === 'period' || Number.isFinite(value))) return [];
    rows.push(row);
  }
  return rows;
}

function analyzeProduct(product, seriesById, asOf) {
  const savedBom = Object.hasOwn(bomByProductId, product.id) ? bomByProductId[product.id] : null;
  const bom = savedBom ? structuredClone(savedBom) : null;
  const blocked = (issues, explanation, nextStep) => insufficient(asOf, bom, issues, explanation, nextStep);
  if (!bom) return blocked(['No reviewed or prototype BOM/index mapping for this part.'],
    'The available material indices do not establish a reference price for this part. No material composition or cost share has been inferred from its category.',
    'Obtain the material specification, BOM quantities and a baseline cost breakdown before testing a price argument.');

  if (!positive(product.price) || !positive(product.history?.[0])) return blocked(['Current and Oct 2025 baseline purchase prices must be positive.'],
    'A comparable current price and historical baseline are needed to explain price movement.',
    'Verify the purchase price history and price unit for this part.');
  if ((product.currency && product.currency !== bom.currency)
      || (product.pricePeriod && product.pricePeriod !== bomPeriods.current)
      || (product.baselinePeriod && product.baselinePeriod !== bomPeriods.baseline)
      || (product.unit && product.unit !== bom.unit)) return blocked(['Purchase currency, period or unit does not match the prototype BOM basis.'],
    'The available purchase record and BOM cannot be compared on the same basis.',
    'Reconcile the purchase unit, currency and effective periods before using a cost comparison.');

  const series = seriesById instanceof Map ? seriesById.get(bom.seriesId) : seriesById?.[bom.seriesId];
  if (!series || series.id !== bom.seriesId) return blocked([`Required index snapshot unavailable: ${bom.seriesId}`],
    `${bom.material} is mapped, but its required published index snapshot is unavailable. No substitute index has been used.`,
    'Refresh the mapped published index and re-run the automatic analysis.');

  let materialCost;
  try { materialCost = bomMaterialCost(bom); }
  catch (error) { return blocked([error.message], 'The BOM material calculation cannot be verified.', 'Review the BOM quantities, yield and baseline material rate.'); }
  bom.materialCost = materialCost;
  const scenarioInput = {
    baseline: { unitPrice: product.history[0], currency: bom.currency, period: bomPeriods.baseline,
      source: 'Fictional prototype purchase history, Oct 2025, history[0].', bomRevision: bom.revision, unit: bom.unit },
    targetPeriod: bomPeriods.current, asOf,
    drivers: [{ id: `${product.id}:material`, kind: 'cost', baseCost: materialCost.purchaseCost,
      source: bom.source, mappingReason: bom.mappingReason, exposureCurrency: bom.currency,
      series, lagMonths: bom.lagMonths, windowMonths: bom.windowMonths, passThrough: bom.passThrough }],
  };
  const scenario = repriceBom(scenarioInput);
  if (scenario.status !== 'scenario') return blocked([...scenario.issues],
    'The required evidence does not support this comparison as of the analysis time. Missing months or later-retrieved snapshots are not substituted.',
    'Resolve the listed index or baseline evidence issue, then re-run the automatic analysis.');

  const priceGap = { low: product.price - scenario.range.high, central: product.price - scenario.range.central,
    high: product.price - scenario.range.low };
  const threshold = Math.max(0.01, product.price * 0.01);
  const review = priceGap.low > threshold;
  const contribution = scenario.contributions[0];
  const currentMovement = product.price / product.history[0] - 1;
  const explanation = `The Sep 2026 price is ${money(product.price)}/${bom.unit} (${percent(currentMovement)} from Oct 2025). `
    + `The ${bom.material.toLowerCase()} proxy moved ${percent(contribution.ratio - 1)} between Aug 2025 and Jul 2026. `
    + `With the illustrative BOM, a two-month lag and 50–100% pass-through, the indexed baseline is ${money(scenario.range.low)}–${money(scenario.range.high)}/${bom.unit}. `
    + (review ? `The current price exceeds the upper estimate by ${money(priceGap.low)}/${bom.unit}, beyond the 1% review threshold. `
      : 'The current price does not exceed the upper estimate by the 1% review threshold. ')
    + 'This is a prototype cost signal using published indices and assumed BOM inputs; it does not establish achievable savings or a contractual price entitlement.';
  return { status: review ? 'review_price' : 'no_cost_gap',
    headline: review ? 'Cost evidence supports a price review' : 'No price-review signal from this model',
    explanation, nextStep: review
      ? 'Request the supplier’s material and conversion-cost breakdown; verify the BOM, volume and delivery terms before negotiating a price change.'
      : 'Continue monitoring. Verify the BOM assumptions before drawing conclusions about overall price competitiveness.',
    issues: [], scenario, priceGap, analyzedAt: asOf, dataMode, bom, threshold,
    trend: monthlyTrend(product.history, scenarioInput) };
}

/** Automatic, read-only portfolio analysis. Supply asOf explicitly for deterministic replay.
 * The prototype purchasing period is fixed to Sep 2026, not silently advanced to today.
 * Existing targets, approvals and savings are neither inputs nor mutated outputs.
 */
export function analyzePortfolio(products, seriesById, { asOf = new Date().toISOString() } = {}) {
  if (!Array.isArray(products)) throw new TypeError('Products must be an array');
  const results = {};
  for (const product of products) {
    if (!product || typeof product.id !== 'string' || !product.id.length || Object.hasOwn(results, product.id)) {
      throw new TypeError('Every product must have a unique nonempty ID');
    }
    Object.defineProperty(results, product.id, { value: analyzeProduct(product, seriesById, asOf), enumerable: true,
      writable: true, configurable: true });
  }
  return results;
}
