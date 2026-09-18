// Fictional manufacturers, products, prices and fixed 12-month quantities.
export const products = [
  {
    id: 'NF-101', name: 'Steel plate · 4 mm', supplier: 'Nordform',
    qty: 18000, price: 12.8, target: 11.9, flag: 'Price up 9.4%', status: 'New',
    why: 'Unit price increased from €11.70 to €12.80. An approved alternative supplier quotes €11.90.',
    next: 'Confirm the alternative price is still valid and capacity is available, then prepare a price review with Nordform.',
    source: 'Price list + purchase history · sample evidence',
  },
  {
    id: 'NF-204', name: 'Mounting bracket', supplier: 'Nordform',
    qty: 24000, price: 4.6, target: 4.3, flag: 'Price gap 7.0%', status: 'Under review',
    why: 'Current price is €4.60. An existing alternative supplier quotes €4.30; delivery quantities still need checking.',
    next: 'Confirm order quantities and freight are comparable before setting a negotiation target.',
    source: 'Two supplier price lists · sample evidence',
  },
  {
    id: 'NF-310', name: 'Retaining ring', supplier: 'Nordform',
    qty: 30000, price: 1.85, target: null, flag: '', status: 'No action',
    why: 'No material price discrepancy has been identified in the available sample data.',
    next: 'Continue monitoring when the price list changes.',
    source: 'Purchase history · sample evidence',
  },
  {
    id: 'BC-112', name: 'Machined bushing', supplier: 'Baltic Components',
    qty: 16000, price: 6.4, target: 6.08, flag: 'Price gap 5.3%', status: 'Agreed',
    why: 'A price review agreed a new unit price of €6.08, down from €6.40. No purchases at the new price have been recorded yet.',
    next: 'Verify the agreed price on the next purchase order.',
    source: 'Negotiation record · sample evidence',
  },
  {
    id: 'BC-208', name: 'Connecting flange', supplier: 'Baltic Components',
    qty: 6000, price: 18.5, target: 17.6, flag: 'Price up 8.8%', status: 'Negotiating',
    why: 'Price increased from €17.00 to €18.50. The illustrative negotiation target is €17.60; it has not been agreed.',
    next: 'Ask the supplier to explain the increase and respond to the proposed price review.',
    source: 'Price list + negotiation target · sample evidence',
  },
  {
    id: 'BC-320', name: 'Flat washer · M12', supplier: 'Baltic Components',
    qty: 100000, price: 0.42, target: null, flag: '', status: 'No action',
    why: 'No material price discrepancy has been identified in the available sample data.',
    next: 'Continue monitoring when the price list changes.',
    source: 'Purchase history · sample evidence',
  },
  {
    id: 'TM-105', name: 'Aluminium housing', supplier: 'Tekno Metal',
    qty: 4000, price: 22, target: 20.9, flag: 'Index divergence', status: 'Under review',
    why: 'The material benchmark has fallen while the purchase price is unchanged. €20.90 is a preliminary scenario, not a verified market price.',
    next: 'Check the material cost share and index lag before requesting a reduction.',
    source: 'Material index scenario · sample evidence',
  },
  {
    id: 'TM-220', name: 'Hex bolt · M10', supplier: 'Tekno Metal',
    qty: 65000, price: 0.8, target: null, flag: '', status: 'No action',
    why: 'No material price discrepancy has been identified in the available sample data.',
    next: 'Continue monitoring when the price list changes.',
    source: 'Purchase history · sample evidence',
  },
  {
    id: 'TM-304', name: 'Threaded insert', supplier: 'Tekno Metal',
    qty: 20000, price: 3.2, target: 3.04, flag: 'Price gap 5.3%', status: 'New',
    why: 'An existing alternative supplier quotes €3.04 against the current €3.20. Availability is still unconfirmed.',
    next: 'Confirm lead time and how much volume can be moved.',
    source: 'Alternative supplier quote · sample evidence',
  },
];

export const states = ['New', 'Under review', 'Negotiating', 'Agreed', 'No action'];
