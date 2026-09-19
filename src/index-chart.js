const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const month = period => /^\d{4}-(0[1-9]|1[0-2])$/.test(period || '')
  ? new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${period}-01T00:00:00Z`)) : 'Date unavailable';

/** Draw only complete monthly evidence; never manufacture a comparable-price history. */
export function indexComparisonChart(result) {
  const rows = result?.trend;
  const fields = ['pricePaidIndex', 'materialIndex', 'costScenarioIndex'];
  if (!Array.isArray(rows) || rows.length < 2 || rows.some(row => fields.some(key => !Number.isFinite(row[key])))) return '';
  const first = rows[0], last = rows.at(-1);
  const values = rows.flatMap(row => fields.map(key => row[key]));
  const min = Math.floor((Math.min(...values, 100) - 1) / 5) * 5;
  const max = Math.ceil((Math.max(...values, 100) + 1) / 5) * 5;
  const width = 560, height = 226, left = 42, right = 530, top = 18, bottom = 182;
  const x = index => left + index * (right - left) / (rows.length - 1);
  const y = value => bottom - (value - min) / (max - min) * (bottom - top);
  const points = field => rows.map((row, i) => `${x(i).toFixed(1)},${y(row[field]).toFixed(1)}`).join(' ');
  const gap = `${points('pricePaidIndex')} ${rows.map((row, i) => `${x(i).toFixed(1)},${y(row.costScenarioIndex).toFixed(1)}`).reverse().join(' ')}`;
  const series = [['pricePaidIndex', 'paid', 'Price paid'], ['costScenarioIndex', 'cost', 'BOM cost estimate'], ['materialIndex', 'material', 'Material index']];
  const observation = result.scenario?.contributions?.[0];
  return `<figure class="p-index-chart" aria-label="Price paid compared with material movement and BOM cost estimate">
    <figcaption><strong>Is the price moving with material costs?</strong><span>${esc(month(first.period))} = 100 · monthly comparison</span></figcaption>
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="From a baseline of 100: price paid ${last.pricePaidIndex.toFixed(1)}, BOM cost estimate ${last.costScenarioIndex.toFixed(1)}, material index ${last.materialIndex.toFixed(1)}">
      ${Array.from({ length: 5 }, (_, i) => min + i * (max - min) / 4).map(value => `<line class="p-index-grid" x1="${left}" x2="${right}" y1="${y(value)}" y2="${y(value)}"/><text class="p-index-axis" x="32" y="${y(value) + 4}" text-anchor="end">${value.toFixed(0)}</text>`).join('')}
      ${result.status === 'review_price' ? `<polygon class="p-index-gap" points="${gap}"/>` : ''}
      ${series.map(([field, kind]) => `<polyline class="p-index-line p-index-line--${kind}" points="${points(field)}"/><circle class="p-index-dot p-index-dot--${kind}" cx="${right}" cy="${y(last[field])}" r="4"/>`).join('')}
      <text class="p-index-axis" x="${left}" y="210">${esc(month(first.period))}</text><text class="p-index-axis" x="${right}" y="210" text-anchor="end">${esc(month(last.period))}</text>
    </svg>
    <ul class="p-index-legend">${series.map(([field, kind, label]) => `<li><i class="p-index-key p-index-key--${kind}" aria-hidden="true"></i><span>${label} <strong>${last[field].toFixed(1)}</strong></span></li>`).join('')}</ul>
    <p class="p-index-caption">${esc(result.bom?.material || 'Material')} · ${observation ? `${esc(month(observation.base.observations[0].period))}–${esc(month(observation.target.observations.at(-1).period))} observations, aligned with a ${esc(observation.lagMonths)}-month lag. ` : ''}Published material proxy; illustrative purchase history and BOM. ${result.status === 'review_price' ? 'The shaded gap is a reason to investigate, not proven savings.' : 'The model does not support a material-cost price-review signal.'}</p>
  </figure>`;
}
