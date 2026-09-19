// Fictional purchasing data for the Procus prototype.
// Suppliers, part numbers and prices are invented. Monthly price series are
// generated from a fixed seed so every reload, test run and screenshot is identical.

export const period = { start: 'Oct 2025', end: 'Sep 2026' };
export const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
export const states = ['New', 'Under review', 'Negotiating', 'Agreed', 'No action'];

export const suppliers = [
  { name: 'Nordform Oy', country: 'Finland', focus: 'Sheet metal & fabrication', contact: 'Henrik Salo', terms: 'Net 45 · DAP Tampere', contract: 'Frame agreement to Mar 2027' },
  { name: 'Baltic Components UAB', country: 'Lithuania', focus: 'Machined components', contact: 'Rasa Petrauskienė', terms: 'Net 30 · FCA Kaunas', contract: 'Frame agreement to Dec 2026' },
  { name: 'Tekno Metal AB', country: 'Sweden', focus: 'Aluminium castings', contact: 'Johan Lind', terms: 'Net 30 · DAP Västerås', contract: 'Frame agreement to Aug 2027' },
  { name: 'Rhein Präzision GmbH', country: 'Germany', focus: 'Precision machining', contact: 'Katrin Vogel', terms: 'Net 60 · EXW Solingen', contract: 'Expires Jan 2027 · 3 months notice' },
  { name: 'Vantaa Polymer Oy', country: 'Finland', focus: 'Polymer & moulding', contact: 'Elina Korhonen', terms: 'Net 30 · DAP Vantaa', contract: 'Rolling 12 months' },
  { name: 'Adriatic Fasteners d.o.o.', country: 'Croatia', focus: 'Fasteners & hardware', contact: 'Ivan Marić', terms: 'Net 45 · FCA Rijeka', contract: 'Spot orders · no frame agreement' },
  { name: 'Lumen Electro Oy', country: 'Finland', focus: 'Electrical & drives', contact: 'Petri Aalto', terms: 'Net 30 · DAP Espoo', contract: 'Frame agreement to Jun 2027' },
  { name: 'Kraków Tooling Sp. z o.o.', country: 'Poland', focus: 'Tooling & wear parts', contact: 'Agnieszka Nowak', terms: 'Net 45 · DAP Kraków', contract: 'Expires Feb 2027 · under review' },
];

// [id, name, category, annual volume, unit price, 12-month price change %, signal, achievable reduction %, status]
const catalog = [
  ['Nordform Oy', [
    ['NF-101', 'Steel plate · 4 mm', 'Sheet metal', 120000, 12.8, 9.4, 'increase', 7, 'New'],
    ['NF-118', 'Laser-cut bracket', 'Sheet metal', 96000, 4.6, 7.2, 'benchmark', 6.5, 'New'],
    ['NF-204', 'Mounting bracket', 'Fabrication', 124000, 6.95, 2.1, 'benchmark', 5, 'Under review'],
    ['NF-231', 'Welded frame assembly', 'Fabrication', 14000, 86.4, 11.8, 'increase', 8.2, 'Negotiating'],
    ['NF-310', 'Retaining ring', 'Turned parts', 240000, 1.85, -0.4, null, 0, 'No action'],
    ['NF-355', 'Steel tube · 30×2 mm', 'Sheet metal', 60000, 9.2, 4.6, 'index', 4.5, 'Under review'],
    ['NF-402', 'Cover panel · powder coated', 'Fabrication', 32000, 18.6, 1.2, null, 0, 'No action'],
  ]],
  ['Baltic Components UAB', [
    ['BC-112', 'Machined bushing', 'Turned parts', 96000, 6.4, 3.1, 'benchmark', 5, 'Agreed'],
    ['BC-208', 'Connecting flange', 'Machined', 42000, 18.5, 8.8, 'increase', 4.9, 'Negotiating'],
    ['BC-241', 'Gear shaft · hardened', 'Machined', 18000, 42.8, 6.4, 'benchmark', 7.5, 'New'],
    ['BC-275', 'Pump housing', 'Machined', 9500, 96.5, 2.4, 'index', 5.5, 'Under review'],
    ['BC-320', 'Flat washer · M12', 'Fasteners', 420000, 0.42, 0.6, null, 0, 'No action'],
    ['BC-388', 'Spacer sleeve', 'Turned parts', 88000, 2.35, 12.4, 'increase', 9, 'New'],
  ]],
  ['Tekno Metal AB', [
    ['TM-105', 'Aluminium housing', 'Castings', 26000, 22.4, 12, 'increase', 10, 'Under review'],
    ['TM-140', 'Die-cast end cap', 'Castings', 74000, 7.4, 5.8, 'benchmark', 6, 'New'],
    ['TM-198', 'Heat sink profile', 'Extrusions', 38000, 14.9, 3.2, 'index', 4.2, 'New'],
    ['TM-220', 'Hex bolt · M10', 'Fasteners', 310000, 0.8, 1.4, 'fragmented', 11, 'New'],
    ['TM-304', 'Threaded insert', 'Fasteners', 150000, 3.2, 5.3, 'benchmark', 5, 'Agreed'],
    ['TM-361', 'Cast bracket · left', 'Castings', 21000, 31.2, 9.6, 'increase', 7.8, 'Negotiating'],
  ]],
  ['Rhein Präzision GmbH', [
    ['RP-070', 'Precision spindle', 'Machined', 4200, 184, 7.4, 'increase', 6, 'New'],
    ['RP-115', 'Ball screw assembly', 'Machined', 6800, 128.5, 4.1, 'benchmark', 8.4, 'Agreed'],
    ['RP-162', 'Linear guide rail', 'Machined', 12000, 74.2, 2.2, 'expiry', 5.5, 'New'],
    ['RP-208', 'Bearing block', 'Machined', 22000, 28.9, 1.1, null, 0, 'No action'],
    ['RP-244', 'Coupling · 25 mm', 'Machined', 16500, 36.4, 6.9, 'benchmark', 6.8, 'Negotiating'],
    ['RP-301', 'Sealing plate', 'Machined', 34000, 11.75, 0.3, null, 0, 'No action'],
  ]],
  ['Vantaa Polymer Oy', [
    ['VP-045', 'Injection-moulded cover', 'Moulded', 165000, 3.85, 6.2, 'benchmark', 7.2, 'New'],
    ['VP-088', 'Gasket · EPDM', 'Seals', 210000, 1.15, 9.9, 'increase', 8, 'New'],
    ['VP-130', 'Cable grommet', 'Moulded', 380000, 0.34, 2.6, 'fragmented', 9.5, 'Under review'],
    ['VP-176', 'Polymer bearing', 'Moulded', 64000, 5.6, 1.8, null, 0, 'No action'],
    ['VP-215', 'Protective cap', 'Moulded', 290000, 0.28, 0.9, null, 0, 'No action'],
    ['VP-260', 'O-ring set', 'Seals', 120000, 0.94, 7.7, 'offcontract', 12, 'Agreed'],
  ]],
  ['Adriatic Fasteners d.o.o.', [
    ['AF-012', 'Socket screw · M8×25', 'Fasteners', 540000, 0.19, 4.2, 'fragmented', 14, 'New'],
    ['AF-058', 'Lock nut · M12', 'Fasteners', 260000, 0.36, 2.8, 'benchmark', 8.5, 'Under review'],
    ['AF-093', 'Rivet · blind 4.8 mm', 'Fasteners', 720000, 0.09, 1.1, null, 0, 'No action'],
    ['AF-141', 'Threaded rod · M16', 'Fasteners', 48000, 4.2, 11.2, 'increase', 9.4, 'Negotiating'],
    ['AF-190', 'Spring washer · M10', 'Fasteners', 380000, 0.11, -1.2, null, 0, 'No action'],
    ['AF-233', 'Hose clamp · 40 mm', 'Hardware', 96000, 1.24, 5.9, 'offcontract', 10, 'New'],
  ]],
  ['Lumen Electro Oy', [
    ['LE-021', 'Servo drive · 2.2 kW', 'Drives', 2400, 412, 3.6, 'expiry', 6.5, 'Under review'],
    ['LE-064', 'Control cable · 5×1.5', 'Cabling', 88000, 3.95, 14.2, 'increase', 10.5, 'New'],
    ['LE-109', 'Terminal block', 'Electrical', 195000, 1.42, 2.2, 'benchmark', 6, 'New'],
    ['LE-152', 'Proximity sensor', 'Sensors', 24000, 28.6, 5.4, 'benchmark', 7, 'Negotiating'],
    ['LE-198', 'Contactor · 25 A', 'Electrical', 16000, 34.2, 1.6, null, 0, 'No action'],
    ['LE-244', 'Power supply · 24 V', 'Electrical', 9800, 96.8, 8.1, 'increase', 6.2, 'New'],
  ]],
  ['Kraków Tooling Sp. z o.o.', [
    ['KT-030', 'Carbide insert · CNMG', 'Tooling', 145000, 5.85, 7.9, 'benchmark', 8, 'New'],
    ['KT-077', 'Wear plate · Hardox', 'Wear parts', 18000, 46.3, 4.4, 'index', 5.2, 'Agreed'],
    ['KT-124', 'Drill bit · HSS 12 mm', 'Tooling', 62000, 4.15, 3.1, 'fragmented', 10.5, 'New'],
    ['KT-168', 'Milling cutter · 16 mm', 'Tooling', 8400, 68.4, 2.7, null, 0, 'No action'],
    ['KT-205', 'Guide bushing', 'Wear parts', 34000, 12.6, 9.2, 'increase', 7.4, 'Negotiating'],
    ['KT-250', 'Tool holder · HSK63', 'Tooling', 2600, 178, 1.4, 'expiry', 4.8, 'Under review'],
  ]],
];

export const signalTypes = {
  increase: { label: 'Unexplained price increase', short: 'Price up', agent: 'Price Watch' },
  benchmark: { label: 'Cheaper qualified source', short: 'Benchmark gap', agent: 'Benchmark' },
  index: { label: 'Material cost review', short: 'Cost review', agent: 'Index Tracker' },
  fragmented: { label: 'Volume split across suppliers', short: 'Split volume', agent: 'Benchmark' },
  offcontract: { label: 'Buying outside the agreement', short: 'Off contract', agent: 'Contract Watch' },
  expiry: { label: 'Agreement ending soon', short: 'Contract ending', agent: 'Contract Watch' },
};

// Months of invoices already seen at the agreed price. This is what separates a
// realised saving from an agreed one: an agreement that nothing has been bought
// against yet is worth nothing until it shows up on an invoice.
const verifiedMonths = { 'BC-112': 4, 'TM-304': 6, 'RP-115': 2, 'VP-260': 0, 'KT-077': 0 };

const money = value => `€${value.toFixed(value < 1 ? 3 : 2)}`;
const pct = value => `${value > 0 ? '+' : ''}${value.toFixed(1)} %`;
const owners = ['Alex Kim', 'Mira Laine', 'Tomas Berg', 'Sofia Ruiz'];

function seeded(seed) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const round = value => Number(value.toFixed(value < 1 ? 3 : 2));

// Price increases arrive as a step change; other signals drift.
function progressAt(signal, fraction) {
  if (signal === 'increase') return fraction < 0.58 ? fraction * 0.14 : 0.14 + ((fraction - 0.58) / 0.42) * 0.86;
  if (signal === 'expiry') return fraction * fraction;
  return fraction;
}

function buildHistory(price, change, signal, random) {
  const start = round(price / (1 + change / 100));
  const series = [start];
  for (let index = 1; index < 11; index += 1) {
    const drift = start + (price - start) * progressAt(signal, index / 11);
    series.push(round(drift * (1 + (random() - 0.5) * 0.012)));
  }
  series.push(price);
  return series;
}

const evidence = {
  increase: product => ({
    why: `${product.supplier} moved ${product.id} from ${money(product.history[0])} to ${money(product.price)} in twelve months (${pct(product.change)}) with no change to drawing revision, volume or delivery terms. Comparable ${product.category.toLowerCase()} parts in the same period moved ${pct(Math.max(0.6, product.change / 3.1))}.`,
    next: `Ask ${product.contact} for the cost breakdown behind the step change and open a price review at ${money(product.target)}.`,
    source: '24 months of invoice lines + category movement',
  }),
  benchmark: product => ({
    why: `A qualified alternative source quotes ${money(product.target)} against the ${money(product.price)} you pay today — a gap of ${product.gapPct.toFixed(1)} % on ${new Intl.NumberFormat('en-IE').format(product.qty)} units a year. The alternative is already approved for two adjacent part numbers.`,
    next: `Confirm lead time and tooling transfer cost, then use the quote as the reference price with ${product.contact}.`,
    source: 'Approved supplier quotes · same specification',
  }),
  index: product => ({
    why: `${product.id} is monitored for material-cost movement. The automatic analysis checks the available BOM and matched index evidence before identifying a price-review reason.`,
    next: `Use the automatic cost finding to prepare the review with ${product.contact}; request any missing material breakdown or index mapping.`,
    source: 'Automatic BOM and index assessment; no verified contractual index clause supplied',
  }),
  fragmented: product => ({
    why: `The same specification is bought from three suppliers at ${money(product.price)}, ${money(round(product.price * 0.93))} and ${money(product.target)}. Consolidating the annual volume onto the lowest qualified source closes a ${product.gapPct.toFixed(1)} % gap.`,
    next: 'Confirm all three part numbers are interchangeable, then consolidate the volume in one award.',
    source: 'Duplicate specification match across suppliers',
  }),
  offcontract: product => ({
    why: `${Math.round(product.gapPct * 4.4)} % of this year's orders were placed outside the agreement at list price instead of the contracted ${money(product.target)}. The agreement price was available on every one of those orders.`,
    next: 'Route the part through the agreement in the ordering system and recover the difference on open orders.',
    source: 'Purchase orders matched against agreement price list',
  }),
  expiry: product => ({
    why: `The agreement covering ${product.id} ends within the notice period and renews at list price by default. Current pricing is ${product.gapPct.toFixed(1)} % above what two comparable suppliers quote for the same annual volume.`,
    next: 'Start the renewal now with the benchmark as the opening position, before automatic renewal removes the leverage.',
    source: 'Contract calendar + renewal benchmark',
  }),
};

const quietEvidence = product => ({
  why: `No material price movement in the last twelve months (${pct(product.change)}) and no cheaper qualified source in the data. ${product.id} is monitored on every price list update.`,
  next: 'No action needed. Procus re-checks this part whenever a price list or invoice changes.',
  source: 'Continuous monitoring · invoice lines',
});

const random = seeded(20260919);

export const products = catalog.flatMap(([supplierName, rows]) => {
  const supplier = suppliers.find(entry => entry.name === supplierName);
  return rows.map(([id, name, category, qty, price, change, signal, reductionPct, status], index) => {
    const product = {
      id, name, category, supplier: supplierName, contact: supplier.contact,
      qty, price, change, signal, status,
      target: signal ? round(price * (1 - reductionPct / 100)) : null,
      gapPct: reductionPct,
      history: buildHistory(price, change, signal, random),
      owner: signal ? owners[(id.charCodeAt(3) + index) % owners.length] : '—',
      verifiedMonths: verifiedMonths[id] ?? 0,
      daysInStage: signal ? 3 + Math.floor(random() * 26) : 0,
    };
    // One coherent illustrative pitch scenario, shared by every screen and total.
    if (id === 'TM-105') {
      product.assembly = 'Conveyor drive module';
      product.negotiation = { openingPct: 10, laaPct: 6, indexChange: 3, comparableGap: 8, alternativeGap: 11 };
    }
    const copy = id === 'TM-105' ? {
      why: 'The pitch example shows the unit price increasing from €20.00 to €22.40 (+12%), aluminium +3% over the same period, an internal comparable 8% below the current price and an indicative alternative quote 11% below. These are illustrative comparisons from the pitch, not retrieved market evidence. Confirm specifications, delivered cost and qualification. A verified aluminium BOM and index mapping are still needed for the sourced cost assessment.',
      next: 'Review the proposed 10% opening reduction and 6% internal minimum, then prepare the supplier conversation. Request alternative quotes if the current supplier cannot meet the terms.',
      source: 'Founder pitch, procus-pitch.md §11: illustrative price, index and quote signals; sourced aluminium BOM assessment unavailable',
    } : signal ? evidence[signal](product) : quietEvidence(product);
    return { ...product, ...copy, flag: signal ? signalTypes[signal].short : '' };
  });
});

// What the agents have been doing. Newest first.
export const agents = [
  { id: 'price-watch', name: 'Price Watch', state: 'running', role: 'Reads every price list and invoice line and flags movement that has no explanation behind it.', now: 'TM-105 unit price increased 12%; the automatic assessment identifies missing aluminium cost evidence.', lastRun: '4 minutes ago', checked: 18420, found: 11 },
  { id: 'benchmark', name: 'Benchmark', state: 'running', role: 'Matches your specifications against quotes from qualified alternative sources.', now: 'Matching 6 fastener specifications across three suppliers for duplicate part numbers.', lastRun: '12 minutes ago', checked: 4860, found: 13 },
  { id: 'index', name: 'Index Tracker', state: 'running', role: 'Checks matched BOM costs against published index snapshots and explains price-review signals or missing evidence.', now: 'Cost findings are calculated automatically for the portfolio. Unsupported material mappings remain requests for evidence.', lastRun: 'On workspace load', checked: 49, found: 0 },
  { id: 'negotiator', name: 'Negotiation Desk', state: 'waiting', role: 'Prepares briefs, drafts supplier messages and tracks replies. Never sends without approval.', now: '4 messages sent and awaiting supplier replies, 2 drafts waiting for your approval.', lastRun: '38 minutes ago', checked: 21, found: 6 },
  { id: 'contract', name: 'Contract Watch', state: 'running', role: 'Watches agreement end dates, notice periods and orders placed outside the agreement.', now: 'Checking notice periods on two agreements that renew automatically within 90 days.', lastRun: '1 hour ago', checked: 8, found: 4 },
  { id: 'data-quality', name: 'Data Quality', state: 'blocked', role: 'Keeps part numbers, units and specifications aligned across systems.', now: 'Blocked: 3 part numbers have conflicting units of measure in the ERP export.', lastRun: '6 hours ago', checked: 48, found: 3 },
];

export const activity = [
  { time: '09:42', agent: 'Price Watch', kind: 'found', text: 'Flagged TM-105 Aluminium housing — price +12%. Review comparable-price evidence while the material mapping is incomplete.', product: 'TM-105' },
  { time: '09:38', agent: 'Negotiation Desk', kind: 'reply', text: 'Nordform replied on NF-231 Welded frame assembly and offered €82.10 against the €79.31 target.', product: 'NF-231' },
  { time: '09:15', agent: 'Benchmark', kind: 'found', text: 'Matched AF-012 Socket screw to two qualified sources at 14 % below the current price.', product: 'AF-012' },
  { time: '08:57', agent: 'Contract Watch', kind: 'alert', text: 'Rhein Präzision agreement enters its notice period in 21 days and renews at list price by default.', product: 'RP-162' },
  { time: '08:31', agent: 'Negotiation Desk', kind: 'sent', text: 'Sent the approved price review request for BC-208 Connecting flange to Baltic Components.', product: 'BC-208' },
  { time: '08:04', agent: 'Data Quality', kind: 'blocked', text: 'Cannot reconcile VP-130 Cable grommet: ERP reports pieces, supplier invoices report boxes of 500.', product: 'VP-130' },
  { time: 'Yesterday', agent: 'Negotiation Desk', kind: 'done', text: 'Kraków Tooling confirmed the index adjustment on KT-077 Wear plate. Agreed €43.89 from 1 October.', product: 'KT-077' },
  { time: 'Yesterday', agent: 'Index Tracker', kind: 'found', text: 'TM-105 needs an aluminium BOM and applicable source series before a material-cost comparison can be calculated.', product: 'TM-105' },
  { time: 'Yesterday', agent: 'Price Watch', kind: 'found', text: 'Flagged BC-388 Spacer sleeve — third increase in twelve months, now 12.4 % above the starting price.', product: 'BC-388' },
];

export const conversations = [
  {
    id: 'CV-01', supplier: 'Nordform Oy', product: 'NF-231', subject: 'Price review · Welded frame assembly',
    agent: 'Negotiation Desk', state: 'replied', updated: '38 minutes ago', needs: 'decision',
    ask: 'Nordform countered at €82.10 against the €79.31 target — €3.5 k below the opportunity. Accept, counter once more, or hand over to you?',
    messages: [
      { from: 'agent', when: 'Mon 08:20', text: 'Requested the cost breakdown behind the 11.8 % increase on NF-231 and proposed a review at €79.31 for the 14 000 unit annual volume.' },
      { from: 'supplier', when: 'Tue 16:40', text: 'Henrik Salo: steel input costs rose through Q2. We can move to €82.10 if the annual volume is committed for twelve months.' },
      { from: 'agent', when: 'Wed 09:38', text: 'Checked the commitment against the demand plan — the volume is already firm. €82.10 captures 74 % of the identified opportunity.' },
    ],
  },
  {
    id: 'CV-02', supplier: 'Baltic Components UAB', product: 'BC-208', subject: 'Explanation requested · Connecting flange',
    agent: 'Negotiation Desk', state: 'awaiting', updated: '2 hours ago', needs: null,
    ask: null,
    messages: [
      { from: 'agent', when: 'Wed 08:31', text: 'Asked Rasa Petrauskienė to explain the increase from €17.00 to €18.50 and to respond to a review at €17.59.' },
    ],
  },
  {
    id: 'CV-03', supplier: 'Lumen Electro Oy', product: 'LE-064', subject: 'Draft ready · Control cable 5×1.5',
    agent: 'Negotiation Desk', state: 'draft', updated: '1 hour ago', needs: 'approval',
    ask: 'A price review request is drafted and ready to send. It opens at €3.53 against the current €3.95, worth €37 k a year.',
    messages: [
      { from: 'agent', when: 'Draft', text: 'Petri — the unit price on LE-064 has moved 14.2 % over twelve months while copper has been flat since March. We would like to review the price at €3.53 for the committed 88 000 m annual volume. Can you share the cost basis before Friday?' },
    ],
  },
  {
    id: 'CV-04', supplier: 'Rhein Präzision GmbH', product: 'RP-162', subject: 'Renewal notice · Linear guide rail',
    agent: 'Contract Watch', state: 'issue', updated: '3 hours ago', needs: 'decision',
    ask: 'The agreement renews automatically in 21 days. Notice has to be served this week to keep the renewal open for negotiation.',
    messages: [
      { from: 'agent', when: 'Mon 11:05', text: 'Flagged that the Rhein Präzision agreement renews at list price unless notice is served by 10 October.' },
      { from: 'supplier', when: 'Tue 09:22', text: 'Katrin Vogel: we are happy to extend on current terms. A renewal proposal follows next week.' },
      { from: 'agent', when: 'Wed 07:40', text: 'Two qualified suppliers quote 5.5 % below current pricing for the same annual volume. Serving notice keeps that on the table without ending the relationship.' },
    ],
  },
  {
    id: 'CV-05', supplier: 'Vantaa Polymer Oy', product: 'VP-130', subject: 'Unclear · Cable grommet unit of measure',
    agent: 'Data Quality', state: 'issue', updated: '5 hours ago', needs: 'input',
    ask: 'Your ERP records VP-130 in pieces, Vantaa Polymer invoices in boxes of 500. The price comparison is on hold until one of them is confirmed.',
    messages: [
      { from: 'agent', when: 'Tue 14:10', text: 'Asked Elina Korhonen to confirm whether the €0.34 line price is per piece or per box.' },
      { from: 'supplier', when: 'Wed 08:04', text: 'Elina Korhonen: the price list is per piece, but order confirmations are issued per box. Both appear in our system.' },
    ],
  },
  {
    id: 'CV-06', supplier: 'Kraków Tooling Sp. z o.o.', product: 'KT-077', subject: 'Agreed · Wear plate index adjustment',
    agent: 'Negotiation Desk', state: 'agreed', updated: 'Yesterday', needs: null,
    ask: null,
    messages: [
      { from: 'agent', when: 'Thu 10:15', text: 'Applied the index clause and requested an adjustment to €43.89 from 1 October.' },
      { from: 'supplier', when: 'Fri 13:30', text: 'Agnieszka Nowak: confirmed. €43.89 applies from 1 October, price list updated.' },
      { from: 'agent', when: 'Yesterday', text: 'Recorded €43 337 annual impact and set a check on the next purchase order to verify the price is applied.' },
    ],
  },
];
