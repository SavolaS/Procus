import test from 'node:test';
import assert from 'node:assert/strict';
import { compareReferencePrices, compareReferenceRows } from '../src/reference-prices.js';
import { referenceDataByProductId } from '../src/reference-data.js';
import { products } from '../src/data.js';

const asOf = '2026-09-19T12:00:00.000Z';
const fixture = () => structuredClone(referenceDataByProductId['NF-101']);
const single = () => { const data = fixture(); return { context: data.context, row: data.rows[0] }; };
const evaluate = ({ context, row }, timestamp = asOf) => compareReferenceRows(context, [row], { asOf: timestamp });
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} != ${expected}`);

test('pack prices normalize before explicit recurring delivered charges and remain traceable', () => {
  const result = compareReferencePrices({ id: 'NF-101' }, { asOf });
  assert.equal(result.eligible.length, 2);
  assert.equal(result.lowestComparable.id, 'nf101-pack10');
  close(result.lowestComparable.normalizedUnitPrice, 10.4);
  close(result.lowestComparable.landedUnitPrice, 10.7);
  assert.equal(result.lowestComparable.priceBasis.unitsPerPrice, 10);
  assert.equal(result.lowestComparable.orderQuantity, 2000);
  assert.equal(result.lowestComparable.unit, 'piece');
  assert.ok(result.lowestComparable.source.documentId.startsWith('demo-'));
  assert.deepEqual(result.lowestComparable.reasonCodes, ['comparable_quote']);
  assert.equal(result.dataMode, 'illustrative_quotes');
  assert.equal(result.savings, undefined);
});

test('cheap expired, wrong revision and unknown freight evidence does not become a numeric quote', () => {
  const result = compareReferencePrices({ id: 'NF-101' }, { asOf });
  for (const [id, code] of [['nf101-expired', 'quote_expired'], ['nf101-wrong-revision', 'revision_mismatch'],
    ['nf101-unknown-freight', 'unknown_freight']]) {
    const excluded = result.excluded.find(row => row.id === id);
    assert.ok(excluded.reasonCodes.includes(code));
    assert.ok(excluded.reasons.length);
    assert.equal(excluded.normalizedUnitPrice, undefined);
    assert.equal(excluded.landedUnitPrice, undefined);
  }
});

test('historical pack invoice stays historical even when it is cheaper than all eligible quotes', () => {
  const result = compareReferencePrices({ id: 'NF-101' }, { asOf });
  assert.equal(result.historical.length, 1);
  close(result.historical[0].normalizedUnitPrice, 10.3);
  close(result.historical[0].landedUnitPrice, 10.5);
  assert.equal(result.historical[0].observedOn, '2026-07-10');
  assert.deepEqual(result.historical[0].reasonCodes, ['historical_context_only']);
  assert.ok(!result.eligible.some(row => row.evidenceKind === 'history'));
  const onlyHistory = fixture();
  onlyHistory.rows = onlyHistory.rows.filter(row => row.evidenceKind === 'history');
  assert.equal(compareReferenceRows(onlyHistory.context, onlyHistory.rows, { asOf }).lowestComparable, null);
});

test('quantity tiers use explicit order batches, never product annual demand', () => {
  const data = single();
  data.row.minOrderQuantity = 3000;
  assert.ok(evaluate(data).excluded[0].reasonCodes.includes('order_quantity_mismatch'));
  data.context.orderQuantity = 3000;
  assert.equal(evaluate(data).eligible.length, 1);
  data.context.orderQuantity = 2001;
  data.row.minOrderQuantity = 100;
  data.row.orderMultiple = 10;
  assert.ok(evaluate(data).excluded[0].reasonCodes.includes('order_quantity_mismatch'));
  const a = compareReferencePrices({ id: 'NF-101', qty: 120000 }, { asOf });
  const b = compareReferencePrices({ id: 'NF-101', qty: 1 }, { asOf });
  assert.deepEqual(a, b);
});

test('specification, revision, units, delivery site, terms and part/site approval must match', () => {
  const cases = [
    [data => { data.row.specificationId = 'OTHER'; }, 'specification_mismatch'],
    [data => { data.row.revision = 'B'; }, 'revision_mismatch'],
    [data => { data.row.unit = 'kg'; }, 'unit_mismatch'],
    [data => { data.row.price.unit = 'kg'; }, 'unit_mismatch'],
    [data => { data.row.destinationSite = 'OTHER'; }, 'destination_mismatch'],
    [data => { data.row.incoterm = 'EXW'; }, 'incoterm_mismatch'],
    [data => { data.row.paymentTerms = 'net30'; }, 'payment_terms_mismatch'],
    [data => { data.row.taxBasis = 'including_vat'; }, 'tax_basis_mismatch'],
    [data => { data.row.approval.status = 'supplier_only'; }, 'part_site_approval_required'],
    [data => { data.row.approval.siteId = 'OTHER'; }, 'part_site_approval_required'],
    [data => { data.row.approval.supplierId = 'OTHER'; }, 'part_site_approval_required'],
    [data => { data.row.approval.revision = 'B'; }, 'part_site_approval_required'],
    [data => { data.row.approval.validUntil = '2026-09-18'; }, 'part_site_approval_required'],
  ];
  for (const [mutate, expected] of cases) {
    const data = single(); mutate(data);
    const result = evaluate(data);
    assert.equal(result.lowestComparable, null);
    assert.ok(result.excluded[0].reasonCodes.includes(expected), expected);
  }
});

test('prices and all charges require explicit finite values and sourced provenance', () => {
  const cases = [
    [data => { delete data.row.source.locator; }, 'missing_source'],
    [data => { data.row.source.capturedAt = '2026-09-20T00:00:00Z'; }, 'missing_source'],
    [data => { delete data.row.approval.source; }, 'part_site_approval_required'],
    [data => { delete data.context.source; }, 'missing_comparison_context'],
    [data => { data.row.price.unitsPerPrice = 0; }, 'invalid_price_basis'],
    [data => { data.row.price.amount = NaN; }, 'invalid_price_basis'],
    [data => { delete data.row.charges.otherRecurringPerUnit; }, 'unknown_recurring_charge'],
    [data => { data.row.charges.freightPerUnit = null; }, 'unknown_freight'],
    [data => { data.row.charges.currency = 'USD'; }, 'charges_currency_mismatch'],
    [data => { data.row.price.amount = Number.MAX_VALUE; data.row.price.unitsPerPrice = 0.0001; }, 'numeric_overflow'],
  ];
  for (const [mutate, expected] of cases) {
    const data = single(); mutate(data);
    const result = evaluate(data);
    assert.equal(result.lowestComparable, null);
    assert.ok(result.excluded[0].reasonCodes.includes(expected), expected);
  }
  const data = single();
  Object.assign(data.row.charges, { freightPerUnit: 0, packagingPerUnit: 0, dutyPerUnit: 0, otherRecurringPerUnit: 0 });
  close(evaluate(data).eligible[0].landedUnitPrice, data.row.price.amount);
});

test('confirmed delivery date and available quantity must cover the required order', () => {
  const cases = [
    [data => { delete data.context.requiredDeliveryDate; }, 'missing_comparison_context'],
    [data => { delete data.row.deliveryConfirmedBy; }, 'missing_delivery_confirmation'],
    [data => { delete data.row.deliveryConfirmationSource; }, 'missing_delivery_confirmation'],
    [data => { data.row.deliveryConfirmedBy = '2026-11-01'; }, 'delivery_timing_mismatch'],
    [data => { data.row.deliveryConfirmedBy = '2026-08-01'; }, 'invalid_delivery_date'],
    [data => { data.row.availableQuantity = 1999; }, 'insufficient_available_quantity'],
    [data => { data.row.availableQuantity = null; }, 'insufficient_available_quantity'],
    [data => { data.row.deliveryConfirmationSource.capturedAt = '2026-09-01T00:00:00Z'; }, 'delivery_source_predates_quote'],
  ];
  for (const [mutate, expected] of cases) {
    const data = single(); mutate(data);
    const result = evaluate(data);
    assert.equal(result.lowestComparable, null);
    assert.ok(result.excluded[0].reasonCodes.includes(expected), expected);
  }
  const data = single();
  data.row.deliveryConfirmedBy = data.context.requiredDeliveryDate;
  data.row.availableQuantity = data.context.orderQuantity;
  const result = evaluate(data);
  assert.equal(result.eligible.length, 1);
  assert.equal(result.eligible[0].delivery.confirmedBy, '2026-10-31');
  assert.match(result.eligible[0].priceScope, /not net savings/);
});

test('validity uses complete inclusive calendar dates and rejects impossible and future dates', () => {
  const data = single();
  assert.equal(evaluate(data, '2026-09-30T23:59:59Z').eligible.length, 1);
  assert.ok(evaluate(data, '2026-10-01T00:00:00Z').excluded[0].reasonCodes.includes('quote_expired'));
  data.row.validFrom = '2026-09-20';
  assert.ok(evaluate(data).excluded[0].reasonCodes.includes('quote_not_yet_valid'));
  data.row.validFrom = '2026-02-30';
  assert.ok(evaluate(data).excluded[0].reasonCodes.includes('invalid_validity_dates'));
  assert.ok(evaluate(data, 'invalid').excluded[0].reasonCodes.includes('invalid_as_of'));
  const history = fixture();
  history.rows = history.rows.filter(row => row.evidenceKind === 'history');
  history.rows[0].observedOn = '2026-09-20';
  assert.ok(compareReferenceRows(history.context, history.rows, { asOf }).excluded[0].reasonCodes.includes('invalid_history_date'));
});

test('duplicate offer identity excludes every conflicting copy rather than selecting a cheap duplicate', () => {
  const { context, row } = single();
  const copy = structuredClone(row);
  copy.id = 'other-import'; copy.price.amount = 1;
  const result = compareReferenceRows(context, [row, copy], { asOf });
  assert.equal(result.lowestComparable, null);
  assert.equal(result.eligible.length, 0);
  assert.equal(result.excluded.length, 2);
  assert.ok(result.excluded.every(entry => entry.reasonCodes.includes('duplicate_offer_identity')));
});

test('foreign currency requires an explicit sourced conversion and EUR never receives FX twice', () => {
  const data = single();
  data.row.price.currency = 'USD';
  assert.ok(evaluate(data).excluded[0].reasonCodes.includes('unsupported_currency'));
  data.row.price.conversion = { fromCurrency: 'USD', toCurrency: 'EUR', rateEuroPerCurrencyUnit: 0.9,
    rateDate: '2026-09-10', source: structuredClone(data.row.source) };
  close(evaluate(data).eligible[0].normalizedUnitPrice, data.row.price.amount * 0.9);
  data.row.price.conversion.fromCurrency = 'GBP';
  assert.equal(evaluate(data).lowestComparable, null);
  data.row.price.currency = 'EUR';
  assert.ok(evaluate(data).excluded[0].reasonCodes.includes('unexpected_currency_conversion'));
});

test('unsupported pitch alternatives stay unqualified and comparisons are replayable without input mutation', () => {
  const part = structuredClone(products.find(row => row.id === 'TM-105'));
  const before = structuredClone(part);
  assert.deepEqual(compareReferencePrices(part, { asOf }), {
    eligible: [], excluded: [], lowestComparable: null, historical: [], dataMode: 'illustrative_quotes',
  });
  assert.deepEqual(part, before);
  const data = fixture();
  const original = structuredClone(data);
  const a = compareReferenceRows(data.context, data.rows, { asOf });
  assert.deepEqual(compareReferenceRows(data.context, data.rows, { asOf }), a);
  assert.deepEqual(data, original);
  a.eligible[0].source.label = 'edited output';
  assert.deepEqual(data, original);
});
