// Shared display of the pitch example; different comparison bases stay explicit.
const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
export function evidenceStrip(product) {
  const n = product.negotiation;
  if (!n) return '';
  const rows = [
    ['Your unit price', `+${product.change}%`, '12-month change', 'price'],
    ['Aluminium index', `+${n.indexChange}%`, 'Same 12 months', 'index'],
    ['Internal comparable', `−${n.comparableGap}%`, 'vs. current unit price', 'comparable'],
    ['Alternative quote', `−${n.alternativeGap}%`, 'Indicative · not qualified', 'alternative'],
  ];
  return `<dl class="p-evidence-strip" aria-label="Price comparison evidence">${rows.map(([label,value,basis,kind]) => `<div data-evidence="${kind}"><dt>${esc(label)}</dt><dd>${esc(value)}</dd><small>${esc(basis)}</small></div>`).join('')}</dl>`;
}
