import { referenceDataByProductId } from './reference-data.js';

const finite = value => typeof value === 'number' && Number.isFinite(value);
const positive = value => finite(value) && value > 0;
const text = value => typeof value === 'string' && value.trim().length > 0;
const blank = () => ({ eligible: [], excluded: [], lowestComparable: null, historical: [], dataMode: 'illustrative_quotes' });

function dateOnly(value) {
  if (!text(value) || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const time = Date.parse(`${value}T00:00:00.000Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value ? value : null;
}

function provenanceValid(source, asOfTime) {
  return source && ['documentId', 'label', 'locator'].every(key => text(source[key]))
    && text(source.capturedAt) && Number.isFinite(Date.parse(source.capturedAt)) && Date.parse(source.capturedAt) <= asOfTime;
}

function identity(row) {
  return ['evidenceKind', 'supplierId', 'offerId', 'lineId'].every(key => text(row?.[key]))
    ? JSON.stringify([row.evidenceKind, row.supplierId, row.offerId, row.lineId]) : null;
}

function excluded(row, problems) {
  return { id: row?.id ?? null, evidenceKind: row?.evidenceKind ?? null, supplierName: row?.supplierName ?? null,
    source: row?.source ? structuredClone(row.source) : null,
    reasonCodes: problems.map(problem => problem.code), reasons: problems.map(problem => problem.message) };
}

/** Normalize only explicitly comparable evidence; history remains non-actionable context.
 * Monetary additions are recurring EUR amounts per delivered context.unit, ex VAT.
 * This excludes one-off tooling, qualification and switching costs: not net savings.
 * Currency conversion requires a separately sourced fixed EUR-per-source-unit rate.
 */
export function compareReferenceRows(context, rows, { asOf = new Date().toISOString() } = {}) {
  const result = blank();
  if (!Array.isArray(rows)) throw new TypeError('Reference evidence rows must be an array');
  const asOfTime = typeof asOf === 'string' ? Date.parse(asOf) : NaN;
  const day = Number.isFinite(asOfTime) ? new Date(asOfTime).toISOString().slice(0, 10) : null;
  const contextValid = context && ['productId', 'specificationId', 'revision', 'unit', 'destinationSite', 'incoterm', 'paymentTerms'].every(key => text(context[key]))
    && context.currency === 'EUR' && context.taxBasis === 'ex_vat' && context.comparisonBasis === 'delivered_recurring_unit_cost'
    && positive(context.orderQuantity) && dateOnly(context.requiredDeliveryDate) && provenanceValid(context.source, asOfTime);
  const identities = new Map();
  const ids = new Map();
  for (const row of rows) {
    const key = identity(row);
    if (key) identities.set(key, (identities.get(key) ?? 0) + 1);
    if (text(row?.id)) ids.set(row.id, (ids.get(row.id) ?? 0) + 1);
  }

  for (const row of rows) {
    const problems = [];
    const fail = (code, message) => { if (!problems.some(problem => problem.code === code)) problems.push({ code, message }); };
    if (!day) fail('invalid_as_of', 'A valid analysis timestamp is required.');
    if (!contextValid) fail('missing_comparison_context', 'A sourced specification, order quantity and delivered-price basis are required.');
    if (!row || !text(row.id) || !identity(row) || !text(row.supplierName)) fail('missing_identity', 'Evidence row, supplier, offer and line identifiers are required.');
    if (!['quote', 'history'].includes(row?.evidenceKind)) fail('unsupported_evidence_kind', 'Evidence must be identified as a quotation or historical purchase.');
    if ((identities.get(identity(row)) ?? 0) > 1 || (ids.get(row?.id) ?? 0) > 1) fail('duplicate_offer_identity', 'Duplicate offer/line identity requires reconciliation; neither copy is selected.');
    if (!provenanceValid(row?.source, asOfTime)) fail('missing_source', 'A document, locator and capture timestamp available at analysis time are required.');
    if (!contextValid || !row) { result.excluded.push(excluded(row, problems)); continue; }

    for (const [key, code, label] of [
      ['productId', 'product_mismatch', 'Part identity'], ['specificationId', 'specification_mismatch', 'Specification'],
      ['revision', 'revision_mismatch', 'Drawing revision'], ['unit', 'unit_mismatch', 'Delivered quantity unit'],
      ['destinationSite', 'destination_mismatch', 'Delivery destination'], ['incoterm', 'incoterm_mismatch', 'Incoterm'],
      ['paymentTerms', 'payment_terms_mismatch', 'Payment terms'], ['taxBasis', 'tax_basis_mismatch', 'Tax basis'],
      ['comparisonBasis', 'cost_basis_mismatch', 'Recurring delivered-cost basis'],
    ]) if (row[key] !== context[key]) fail(code, `${label} does not match the comparison requirement.`);

    const price = row.price;
    if (!price || !positive(price.amount) || !positive(price.unitsPerPrice)) fail('invalid_price_basis', 'A positive source price and units per quoted price are required.');
    if (price?.unit !== context.unit) fail('unit_mismatch', 'The source price unit does not match the delivered comparison unit.');
    if (!positive(row.minOrderQuantity) || !positive(row.maxOrderQuantity) || row.minOrderQuantity > row.maxOrderQuantity
        || !positive(row.orderMultiple)) fail('missing_quantity_tier', 'Explicit minimum, maximum and order multiple are required.');
    else if (context.orderQuantity < row.minOrderQuantity || context.orderQuantity > row.maxOrderQuantity
        || Math.abs(context.orderQuantity / row.orderMultiple - Math.round(context.orderQuantity / row.orderMultiple)) > 1e-9) {
      fail('order_quantity_mismatch', 'The actual comparison batch does not meet the quoted quantity tier or order multiple.');
    }

    const deliveryDate = dateOnly(row.deliveryConfirmedBy);
    if (row.evidenceKind === 'quote') {
      if (!deliveryDate || !provenanceValid(row.deliveryConfirmationSource, asOfTime)) {
        fail('missing_delivery_confirmation', 'A sourced confirmed delivery date and available quantity are required.');
      } else if (deliveryDate > context.requiredDeliveryDate) {
        fail('delivery_timing_mismatch', 'The confirmed delivery date is later than the required arrival date.');
      }
      if (!positive(row.availableQuantity) || row.availableQuantity < context.orderQuantity) {
        fail('insufficient_available_quantity', 'Confirmed available quantity does not cover the comparison order.');
      }
    }

    const chargeKeys = ['freightPerUnit', 'packagingPerUnit', 'dutyPerUnit', 'otherRecurringPerUnit'];
    for (const key of chargeKeys) if (!finite(row.charges?.[key]) || row.charges[key] < 0) {
      fail(key === 'freightPerUnit' ? 'unknown_freight' : 'unknown_recurring_charge', `${key} must be explicit, including zero when already included.`);
    }
    if (row.charges?.currency !== 'EUR') fail('charges_currency_mismatch', 'Recurring delivered charges must be explicitly normalized to EUR per unit.');

    let conversionRate = 1;
    if (price?.currency !== 'EUR') {
      const conversion = price?.conversion;
      const rateDate = dateOnly(conversion?.rateDate);
      if (!text(price?.currency) || !conversion || conversion.toCurrency !== 'EUR' || conversion.fromCurrency !== price.currency
          || !positive(conversion.rateEuroPerCurrencyUnit) || !rateDate || !day || rateDate > day
          || !provenanceValid(conversion.source, asOfTime)) fail('unsupported_currency', 'A foreign-currency price needs an explicit, sourced EUR conversion record.');
      else conversionRate = conversion.rateEuroPerCurrencyUnit;
    } else if (price?.conversion != null) fail('unexpected_currency_conversion', 'An EUR source price must not receive a second currency conversion.');

    const approval = row.approval;
    const approvalFrom = dateOnly(approval?.validFrom);
    const approvalUntil = dateOnly(approval?.validUntil);
    const approvalDay = row.evidenceKind === 'history' ? dateOnly(row.observedOn) : day;
    if (!approval || approval.status !== 'approved' || approval.supplierId !== row.supplierId || approval.productId !== context.productId
        || approval.specificationId !== context.specificationId || approval.revision !== context.revision
        || approval.siteId !== context.destinationSite || !approvalFrom || !approvalUntil || !approvalDay
        || approvalFrom > approvalUntil || approvalDay < approvalFrom || approvalDay > approvalUntil
        || !provenanceValid(approval.source, asOfTime)) fail('part_site_approval_required', 'Documented approval for this specification, revision and destination site is required at the evidence date.');

    if (row.evidenceKind === 'quote') {
      const issued = dateOnly(row.issuedOn), from = dateOnly(row.validFrom), until = dateOnly(row.validUntil);
      if (!issued || !from || !until || issued > from || from > until) fail('invalid_validity_dates', 'Quote issue, start and end dates must be valid and ordered.');
      else {
        if (day && (issued > day || from > day)) fail('quote_not_yet_valid', 'This quotation is not yet valid on the analysis date.');
        if (day && until < day) fail('quote_expired', 'This quotation has expired.');
        if (deliveryDate && deliveryDate < issued) fail('invalid_delivery_date', 'The confirmed delivery date cannot precede quotation issue.');
        if (provenanceValid(row.source, asOfTime) && issued > new Date(row.source.capturedAt).toISOString().slice(0, 10)) fail('source_predates_quote', 'The source capture date cannot precede quotation issue.');
        if (provenanceValid(row.deliveryConfirmationSource, asOfTime)
            && issued > new Date(row.deliveryConfirmationSource.capturedAt).toISOString().slice(0, 10)) fail('delivery_source_predates_quote', 'Delivery confirmation source cannot precede quotation issue.');
      }
    } else if (row.evidenceKind === 'history') {
      const observed = dateOnly(row.observedOn);
      if (!observed || !day || observed > day) fail('invalid_history_date', 'Historical purchase date must be valid and no later than the analysis date.');
      else if (provenanceValid(row.source, asOfTime) && observed > new Date(row.source.capturedAt).toISOString().slice(0, 10)) fail('source_predates_history', 'The source capture date cannot precede the historical purchase.');
    }
    if (problems.length) { result.excluded.push(excluded(row, problems)); continue; }

    const normalizedUnitPrice = price.amount / price.unitsPerPrice * conversionRate;
    const recurringCharges = chargeKeys.reduce((sum, key) => sum + row.charges[key], 0);
    const landedUnitPrice = normalizedUnitPrice + recurringCharges;
    if (!positive(normalizedUnitPrice) || !positive(landedUnitPrice)) {
      result.excluded.push(excluded(row, [{ code: 'numeric_overflow', message: 'Normalized price exceeds supported numeric limits.' }])); continue;
    }
    const normalized = {
      id: row.id, evidenceKind: row.evidenceKind, supplierId: row.supplierId, supplierName: row.supplierName,
      offerId: row.offerId, lineId: row.lineId, normalizedUnitPrice, landedUnitPrice,
      currency: 'EUR', unit: context.unit, orderQuantity: context.orderQuantity,
      validUntil: row.evidenceKind === 'quote' ? row.validUntil : null,
      observedOn: row.evidenceKind === 'history' ? row.observedOn : null,
      source: structuredClone(row.source), approval: structuredClone(row.approval),
      delivery: row.evidenceKind === 'quote' ? { confirmedBy: row.deliveryConfirmedBy, availableQuantity: row.availableQuantity,
        source: structuredClone(row.deliveryConfirmationSource) } : null,
      priceBasis: structuredClone(row.price), charges: structuredClone(row.charges),
      priceScope: 'Recurring delivered unit price, excluding one-off tooling, qualification and switching costs; not net savings.',
      comparisonBasis: structuredClone(context),
      reasonCodes: [row.evidenceKind === 'quote' ? 'comparable_quote' : 'historical_context_only'],
    };
    (row.evidenceKind === 'quote' ? result.eligible : result.historical).push(normalized);
  }
  result.eligible.sort((a, b) => a.landedUnitPrice - b.landedUnitPrice || a.id.localeCompare(b.id));
  result.historical.sort((a, b) => b.observedOn.localeCompare(a.observedOn) || a.id.localeCompare(b.id));
  result.lowestComparable = result.eligible[0] ?? null;
  return result;
}

/** Uses only explicitly authored prototype evidence; never promotes pitch percentages to quotes. */
export function compareReferencePrices(product, { asOf = new Date().toISOString() } = {}) {
  if (!product || typeof product.id !== 'string') throw new TypeError('A product ID is required');
  const fixture = Object.hasOwn(referenceDataByProductId, product.id) ? referenceDataByProductId[product.id] : null;
  return fixture ? compareReferenceRows(fixture.context, fixture.rows, { asOf }) : blank();
}
