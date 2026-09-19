// Deterministic cost-pressure scenarios. Never an executable quote or savings booking.
const finite = value => typeof value === 'number' && Number.isFinite(value);
const positive = value => finite(value) && value > 0;
const fraction = value => finite(value) && value >= 0 && value <= 1;
const requireThat = (condition, message) => { if (!condition) throw new Error(message); };
const hasText = value => typeof value === 'string' && value.trim().length > 0;

function monthNumber(period) {
  requireThat(typeof period === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(period), `Invalid month: ${period}`);
  const [year, month] = period.split('-').map(Number);
  return year * 12 + month - 1;
}

function monthAt(number) {
  return `${Math.floor(number / 12)}-${String(number % 12 + 1).padStart(2, '0')}`;
}

/** All prices are in one explicit currency, per kg; quantities per good part.
 * Scrap recovery is the fraction of process loss actually sold, not yield.
 * Currency conversion must occur before this function.
 */
export function bomMaterialCost({ netMassKg, yieldRate, pricePerKg, recoveryRate, scrapPricePerKg }) {
  requireThat(positive(netMassKg), 'Net mass must be positive');
  requireThat(positive(yieldRate) && yieldRate <= 1, 'Yield must be in (0, 1]');
  requireThat(positive(pricePerKg), 'Purchase price per kg must be positive');
  requireThat(fraction(recoveryRate), 'Scrap recovery rate must be explicit and in [0, 1]');
  requireThat(finite(scrapPricePerKg) && scrapPricePerKg >= 0, 'Scrap price must be explicit and nonnegative');
  const grossMassKg = netMassKg / yieldRate;
  const scrapMassKg = (grossMassKg - netMassKg) * recoveryRate;
  const purchaseCost = grossMassKg * pricePerKg;
  const scrapCredit = scrapMassKg * scrapPricePerKg;
  requireThat([grossMassKg, scrapMassKg, purchaseCost, scrapCredit].every(finite), 'Material calculation exceeds finite numeric limits');
  requireThat(scrapCredit <= purchaseCost, 'Scrap credit exceeds material purchase cost');
  return { grossMassKg, scrapMassKg, purchaseCost, scrapCredit, netCost: purchaseCost - scrapCredit };
}

function validateSeries(series, asOf) {
  requireThat(series && hasText(series.id) && hasText(series.sourceUrl), 'Series identifier and source URL required');
  requireThat(hasText(series.unit) && hasText(series.geography), `${series.id}: unit and geography required`);
  requireThat(Number.isFinite(Date.parse(asOf)), 'Valid as-of timestamp required');
  requireThat(Number.isFinite(Date.parse(series.retrievedAt)), `${series.id}: retrieval timestamp required`);
  // A current snapshot cannot support a historical, point-in-time backtest.
  requireThat(Date.parse(series.retrievedAt) <= Date.parse(asOf), `${series.id}: snapshot was retrieved after as-of time`);
  requireThat(Array.isArray(series.observations), `${series.id}: observations required`);
  const months = new Set();
  for (const observation of series.observations) {
    monthNumber(observation.period);
    requireThat(!months.has(observation.period), `${series.id}: duplicate month ${observation.period}`);
    if (observation.publishedAt != null) {
      const publishedAt = Date.parse(observation.publishedAt);
      requireThat(Number.isFinite(publishedAt), `${series.id}: invalid publication timestamp for ${observation.period}`);
      requireThat(publishedAt <= Date.parse(asOf), `${series.id}: observation ${observation.period} was published after as-of time`);
      requireThat(publishedAt <= Date.parse(series.retrievedAt), `${series.id}: observation ${observation.period} was published after snapshot retrieval`);
    }
    months.add(observation.period);
  }
}

function windowMean(series, period, lagMonths, windowMonths, asOf) {
  const end = monthNumber(period) - lagMonths;
  requireThat(end <= monthNumber(asOf.slice(0, 7)), 'Requested period is in the future');
  const selected = [];
  for (let month = end - windowMonths + 1; month <= end; month++) {
    const key = monthAt(month);
    const observation = series.observations.find(row => row.period === key);
    requireThat(observation && positive(observation.value), `${series.id}: missing or invalid observation for ${key}`);
    selected.push({ period: key, value: observation.value, status: observation.status ?? null,
      ...(observation.publishedAt != null ? { publishedAt: observation.publishedAt } : {}) });
  }
  return { value: selected.reduce((sum, row) => sum + row.value / selected.length, 0), observations: selected };
}

function convertedWindow(costWindow, fxWindow, driverId) {
  const observations = costWindow.observations.map((observation, i) => {
    const fx = fxWindow.observations[i];
    requireThat(observation.period === fx.period, `${driverId}: cost and FX periods must match`);
    const value = observation.value * fx.value;
    requireThat(positive(value), `${driverId}: converted exposure exceeds numeric limits`);
    return { period: observation.period, value, sourceValue: observation.value, fxRate: fx.value };
  });
  const value = observations.reduce((sum, row) => sum + row.value / observations.length, 0);
  requireThat(positive(value), `${driverId}: converted average exceeds numeric limits`);
  return { value, observations };
}

/** Baseline-price bridge: P(t) = P(0) + sum(cost(0) * passThrough * (ratio - 1)).
 * A cost driver is either an index or an absolute commodity-price series.
 * Costs are baseline currency / good part, NOT BOM mass shares.
 * A scrap credit is a separate negative driver linked by parentCostId to its cost.
 * FX series values are baseline currency per one unit of exposure currency.
 * Low/high are scenario extrema, NOT statistical confidence bounds.
 */
export function repriceBom(input) {
  const issues = [];
  const blocked = () => ({ status: 'insufficient_evidence', method: 'indexed_bom_scenario', range: null, issues });
  try {
    requireThat(input && input.baseline, 'Baseline required');
    const { baseline, targetPeriod, asOf, drivers } = input;
    requireThat(positive(baseline.unitPrice), 'Positive baseline price required');
    requireThat(hasText(baseline.currency) && hasText(baseline.source) && hasText(baseline.bomRevision), 'Baseline currency, source and BOM revision required');
    requireThat(monthNumber(targetPeriod) >= monthNumber(baseline.period), 'Target month precedes baseline');
    requireThat(Number.isFinite(Date.parse(asOf)), 'Valid as-of timestamp required');
    requireThat(monthNumber(targetPeriod) <= monthNumber(asOf.slice(0, 7)), 'Target month is in the future');
    requireThat(Array.isArray(drivers) && drivers.length > 0, 'At least one sourced cost driver required');
    requireThat(new Set(drivers.map(driver => driver.id)).size === drivers.length, 'Duplicate cost driver ID');
    const creditsByParent = new Map();
    for (const credit of drivers.filter(driver => driver.kind === 'credit')) {
      const parent = drivers.find(driver => driver.id === credit.parentCostId);
      requireThat(hasText(credit.parentCostId) && parent?.kind === 'cost', `${credit.id}: credit must reference a cost driver via parentCostId`);
      requireThat(positive(credit.baseCost) && positive(parent.baseCost), `${credit.id}: credit and parent baseline costs must be positive`);
      const total = (creditsByParent.get(parent.id) ?? 0) + credit.baseCost;
      requireThat(finite(total) && total <= parent.baseCost, `${credit.id}: aggregate credits exceed parent ${parent.id} purchase cost`);
      creditsByParent.set(parent.id, total);
    }
    let baselineExposure = 0;
    const contributions = [];
    for (const driver of drivers) {
      try {
        requireThat(hasText(driver.id) && hasText(driver.source) && hasText(driver.mappingReason), 'Driver ID, cost source and index mapping rationale required');
        requireThat(positive(driver.baseCost), `${driver.id}: baseline cost must be positive`);
        requireThat(['cost', 'credit'].includes(driver.kind), `${driver.id}: kind must be cost or credit`);
        const sign = driver.kind === 'credit' ? -1 : 1;
        baselineExposure += sign * driver.baseCost;
        requireThat(Number.isInteger(driver.lagMonths) && driver.lagMonths >= 0 && driver.lagMonths <= 24, `${driver.id}: lag must be 0–24 months`);
        requireThat(Number.isInteger(driver.windowMonths) && driver.windowMonths >= 1 && driver.windowMonths <= 12, `${driver.id}: averaging window must be 1–12 months`);
        const pass = driver.passThrough;
        requireThat(pass && [pass.low, pass.central, pass.high].every(fraction) && pass.low <= pass.central && pass.central <= pass.high, `${driver.id}: ordered pass-through assumptions in [0, 1] required`);
        requireThat(hasText(driver.exposureCurrency), `${driver.id}: exposure currency required`);
        validateSeries(driver.series, asOf);
        requireThat(hasText(driver.series.currency) && driver.series.currency === driver.exposureCurrency, `${driver.id}: series currency must match exposure currency`);
        const args = [driver.lagMonths, driver.windowMonths, asOf];
        const base = windowMean(driver.series, baseline.period, ...args);
        const target = windowMean(driver.series, targetPeriod, ...args);
        let ratio = target.value / base.value;
        let fx = null;
        if (driver.exposureCurrency !== baseline.currency) {
          validateSeries(driver.fxSeries, asOf);
          requireThat(driver.fxSeries.baseCurrency === driver.exposureCurrency && driver.fxSeries.quoteCurrency === baseline.currency, `${driver.id}: FX must be ${baseline.currency} per ${driver.exposureCurrency}`);
          const fxBase = windowMean(driver.fxSeries, baseline.period, ...args);
          const fxTarget = windowMean(driver.fxSeries, targetPeriod, ...args);
          const convertedBase = convertedWindow(base, fxBase, driver.id);
          const convertedTarget = convertedWindow(target, fxTarget, driver.id);
          ratio = convertedTarget.value / convertedBase.value;
          fx = { series: driver.fxSeries.id, sourceUrl: driver.fxSeries.sourceUrl, retrievedAt: driver.fxSeries.retrievedAt,
            base: fxBase, target: fxTarget, convertedBase, convertedTarget };
        }
        requireThat(positive(ratio), `${driver.id}: exposure ratio exceeds numeric limits`);
        const fullDelta = sign * driver.baseCost * (ratio - 1);
        const endpoints = [fullDelta * pass.low, fullDelta * pass.high];
        contributions.push({
          id: driver.id, kind: driver.kind, baseCost: driver.baseCost, source: driver.source,
          ...(driver.kind === 'credit' ? { parentCostId: driver.parentCostId } : {}),
          mappingReason: driver.mappingReason, passThrough: { ...pass }, lagMonths: driver.lagMonths,
          windowMonths: driver.windowMonths, ratio, low: Math.min(...endpoints), central: fullDelta * pass.central,
          high: Math.max(...endpoints), series: driver.series.id, sourceUrl: driver.series.sourceUrl,
          retrievedAt: driver.series.retrievedAt, unit: driver.series.unit, geography: driver.series.geography, base, target, fx,
        });
      } catch (error) { issues.push(error.message); }
    }
    if (issues.length) return blocked();
    requireThat(baselineExposure >= 0 && baselineExposure <= baseline.unitPrice, 'Net indexed costs must be between zero and baseline price; check double counting');
    const range = Object.fromEntries(['low', 'central', 'high'].map(key => [key, baseline.unitPrice + contributions.reduce((sum, row) => sum + row[key], 0)]));
    requireThat(range.low >= 0 && Object.values(range).every(finite), 'Scenario produces an invalid price');
    return {
      status: 'scenario', method: 'indexed_bom_scenario', baseline: { ...baseline }, targetPeriod, asOf,
      currency: baseline.currency, range, contributions, indexedCostShare: baselineExposure / baseline.unitPrice,
      fixedResidual: baseline.unitPrice - baselineExposure,
      assumptions: ['Unmodelled conversion, overhead, freight and margin remain fixed in baseline currency.',
        'Ranges vary stated pass-through assumptions only; they are not confidence intervals.',
        'An index proxy is a cost-pressure signal, not a supplier quote or contractual entitlement.'], issues: [],
    };
  } catch (error) { issues.push(error.message); return blocked(); }
}
