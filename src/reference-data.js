// All records below are invented comparison fixtures. They are not supplier offers,
// customer purchase records, approved supplier records, or evidence of savings.
// Order quantity is an explicit illustrative batch, never annual product volume.
const source = (documentId, label, locator = 'line 1') => ({ documentId, label, locator,
  capturedAt: '2026-09-15T10:00:00.000Z' });

const context = {
  productId: 'NF-101', specificationId: 'DEMO-DRAWING-NF101', revision: 'A',
  unit: 'piece', currency: 'EUR', orderQuantity: 2000,
  destinationSite: 'DEMO-TAMPERE-01', incoterm: 'DAP', paymentTerms: 'net45',
  requiredDeliveryDate: '2026-10-31',
  taxBasis: 'ex_vat', comparisonBasis: 'delivered_recurring_unit_cost',
  scopeExclusions: ['One-off tooling', 'Supplier qualification and switching costs', 'Financing and lifecycle costs'],
  source: source('demo-order-context-NF101', 'Illustrative comparison batch and delivery requirements'),
};

function quote(id, supplierId, amount, overrides = {}) {
  return {
    id, evidenceKind: 'quote', supplierId, supplierName: `Illustrative supplier ${supplierId}`,
    offerId: `DEMO-OFFER-${id}`, lineId: '1', productId: context.productId,
    specificationId: context.specificationId, revision: context.revision,
    unit: context.unit, destinationSite: context.destinationSite, incoterm: 'DAP',
    paymentTerms: 'net45', taxBasis: 'ex_vat', comparisonBasis: context.comparisonBasis,
    price: { amount, unitsPerPrice: 1, unit: 'piece', currency: 'EUR' },
    charges: { currency: 'EUR', freightPerUnit: 0.15, packagingPerUnit: 0.05,
      dutyPerUnit: 0, otherRecurringPerUnit: 0 },
    minOrderQuantity: 100, maxOrderQuantity: 5000, orderMultiple: 1,
    deliveryConfirmedBy: '2026-10-15', availableQuantity: 3000,
    deliveryConfirmationSource: source(`demo-delivery-${id}`, 'Invented quote confirmation of delivery date and available quantity'),
    issuedOn: '2026-09-10', validFrom: '2026-09-10', validUntil: '2026-09-30',
    source: source(`demo-source-${id}`, 'Invented supplier quotation for prototype comparison'),
    approval: { status: 'approved', supplierId, productId: context.productId,
      specificationId: context.specificationId, revision: 'A', siteId: context.destinationSite,
      validFrom: '2026-01-01', validUntil: '2026-12-31',
      source: source(`demo-approval-${supplierId}`, 'Invented part and site approval record') },
    ...overrides,
  };
}

const rows = [
  quote('nf101-current', 'A', 10.8),
  quote('nf101-pack10', 'B', 104, { price: { amount: 104, unitsPerPrice: 10, unit: 'piece', currency: 'EUR' },
    orderMultiple: 10, charges: { currency: 'EUR', freightPerUnit: 0.25, packagingPerUnit: 0.05, dutyPerUnit: 0, otherRecurringPerUnit: 0 } }),
  quote('nf101-expired', 'C', 9.4, { issuedOn: '2026-08-01', validFrom: '2026-08-01', validUntil: '2026-08-31' }),
  quote('nf101-wrong-revision', 'D', 10.1, { revision: 'B' }),
  quote('nf101-unknown-freight', 'E', 10.2, { charges: { currency: 'EUR', freightPerUnit: null,
    packagingPerUnit: 0.05, dutyPerUnit: 0, otherRecurringPerUnit: 0 } }),
  quote('nf101-history-pack10', 'INTERNAL', 103, { evidenceKind: 'history',
    offerId: 'DEMO-INVOICE-2026-07', price: { amount: 103, unitsPerPrice: 10, unit: 'piece', currency: 'EUR' },
    observedOn: '2026-07-10', source: source('demo-invoice-nf101-july', 'Invented historical invoice, not an available quote'),
    deliveryConfirmedBy: undefined, availableQuantity: undefined, deliveryConfirmationSource: undefined,
    issuedOn: undefined, validFrom: undefined, validUntil: undefined }),
];

export const referenceDataByProductId = { 'NF-101': { context, rows } };
