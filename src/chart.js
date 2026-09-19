// Small hand-built SVG charts. No dependencies: every colour comes from a CSS
// custom property so the charts follow the theme instead of hard-coding it.

const path = points => points.map((point, index) => `${index ? 'L' : 'M'}${point[0].toFixed(1)} ${point[1].toFixed(1)}`).join(' ');

function scale(values, height, padding = 0.12) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || max || 1;
  const low = min - span * padding;
  const high = max + span * padding;
  return { low, high, y: value => height - ((value - low) / (high - low)) * height };
}

// Inline trend line for a table cell: direction is carried by colour and shape,
// never by colour alone, so it stays readable without it.
export function sparkline(values, direction) {
  const width = 58;
  const height = 18;
  const { y } = scale(values, height - 4, 0.18);
  const step = width / (values.length - 1);
  const points = values.map((value, index) => [index * step, y(value) + 2]);
  const last = points[points.length - 1];
  return `<svg class="p-spark" data-direction="${direction}" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" aria-hidden="true" focusable="false">
    <path d="${path(points)}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="2" fill="currentColor"/>
  </svg>`;
}

// Snap an axis step to 1, 2, 2.5 or 5 times a power of ten.
function niceStep(raw) {
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  return (([1, 2, 2.5, 5].find(factor => raw <= magnitude * factor) ?? 10)) * magnitude;
}

const compact = value => value >= 1000000
  ? `€${(value / 1000000).toFixed(2)}M`
  : value >= 1000 ? `€${Math.round(value / 1000)}k` : `€${Math.round(value)}`;

const unit = value => `€${value.toFixed(value < 1 ? 3 : 2)}`;

// Twelve months of unit price with the reference price drawn in.
export function priceChart(product, target) {
  const width = 300;
  const height = 96;
  const values = target == null ? product.history : [...product.history, target];
  const { y } = scale(values, height, 0.16);
  const inset = 3;
  const step = (width - inset * 2) / (product.history.length - 1);
  const points = product.history.map((value, index) => [inset + index * step, y(value)]);
  const last = points[points.length - 1];
  const area = `${path(points)} L${last[0].toFixed(1)} ${height} L${inset} ${height} Z`;
  return `<figure class="p-pricechart">
    <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="Unit price from ${unit(product.history[0])} to ${unit(product.price)} over twelve months">
      <path class="p-pricechart__area" d="${area}"/>
      <path class="p-pricechart__line" d="${path(points)}"/>
      ${target == null ? '' : `<line class="p-pricechart__target" x1="0" y1="${y(target).toFixed(1)}" x2="${width}" y2="${y(target).toFixed(1)}"/>`}
      <path class="p-pricechart__now-mark" d="M${last[0].toFixed(1)} ${(last[1] - 5).toFixed(1)}V${(last[1] + 5).toFixed(1)}"/>
    </svg>
    <figcaption>
      <span>${unit(product.history[0])}<small>12 months ago</small></span>
      ${target == null ? '' : `<span class="p-pricechart__ref">${unit(target)}<small>reference</small></span>`}
      <span class="p-pricechart__now">${unit(product.price)}<small>now</small></span>
    </figcaption>
  </figure>`;
}

// Monthly spend at the prices actually paid, then three projected months.
export function spendChart(series, months, labels) {
  const width = 860;
  const height = 250;
  const left = 62;
  const bottom = 30;
  const plot = { w: width - left - 12, h: height - bottom - 12 };
  const all = [...series.paid, ...series.forecast.current, ...series.forecast.captured];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const pad = (max - min) * 0.25;
  const step = niceStep((max - min + pad * 2) / 4);
  const low = Math.floor((min - pad) / step) * step;
  const intervals = Math.max(4, Math.ceil((max + pad * 0.5 - low) / step));
  const high = low + step * intervals;
  const y = value => 12 + plot.h - ((value - low) / (high - low)) * plot.h;
  const total = series.paid.length + series.forecast.current.length;
  const x = index => left + (index / (total - 1)) * plot.w;

  const paid = series.paid.map((value, index) => [x(index), y(value)]);
  const anchor = paid[paid.length - 1];
  const branch = key => [anchor, ...series.forecast[key].map((value, index) => [x(series.paid.length + index), y(value)])];
  const ticks = Array.from({ length: intervals + 1 }, (_, index) => low + step * index);
  const forecastStart = x(series.paid.length - 1);

  return `<figure class="p-spendchart">
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Monthly purchasing spend rose from ${compact(series.paid[0])} to ${compact(series.paid[series.paid.length - 1])} over twelve months. Projected at ${compact(series.monthly.agreed)} after agreed changes and ${compact(series.monthly.captured)} if every open opportunity is captured.">
      <rect class="p-spendchart__future" x="${forecastStart}" y="12" width="${width - 12 - forecastStart}" height="${plot.h}"/>
      ${ticks.map(value => `<line class="p-spendchart__grid" x1="${left}" y1="${y(value).toFixed(1)}" x2="${width - 12}" y2="${y(value).toFixed(1)}"/>
        <text class="p-spendchart__ytick" x="${left - 10}" y="${(y(value) + 4).toFixed(1)}" text-anchor="end">${compact(value)}</text>`).join('')}
      ${labels.map((label, index) => index % 2 ? '' : `<text class="p-spendchart__xtick" x="${x(index).toFixed(1)}" y="${height - 8}" text-anchor="middle">${label}</text>`).join('')}
      <path class="p-spendchart__area" d="${path(paid)} L${anchor[0].toFixed(1)} ${12 + plot.h} L${left} ${12 + plot.h} Z"/>
      <path class="p-spendchart__captured" d="${path(branch('captured'))}"/>
      <path class="p-spendchart__agreed" d="${path(branch('agreed'))}"/>
      <path class="p-spendchart__current" d="${path(branch('current'))}"/>
      <path class="p-spendchart__paid" d="${path(paid)}"/>
      ${paid.map(point => `<circle class="p-spendchart__dot" cx="${point[0].toFixed(1)}" cy="${point[1].toFixed(1)}" r="2.5"/>`).join('')}
      <text class="p-spendchart__mark" x="${forecastStart + 10}" y="26">Projected</text>
    </svg>
    <figcaption class="p-spendchart__legend">
      <span data-series="paid">Spend at prices paid</span>
      <span data-series="current">If nothing changes · ${compact(series.monthly.current)}/month</span>
      <span data-series="agreed">After agreed changes · ${compact(series.monthly.agreed)}/month</span>
      <span data-series="captured">All opportunities captured · ${compact(series.monthly.captured)}/month</span>
      <span class="p-spendchart__note">Vertical axis starts at ${compact(low)}, not zero, to show the movement.</span>
    </figcaption>
  </figure>`;
}

// Proportion bars are drawn as SVG rather than a styled div: the app is served
// under a strict Content-Security-Policy with no 'unsafe-inline', so an inline
// style attribute would be dropped and every bar would render full width.
export function bar(fraction, overlay = 0, label = '') {
  const width = 200;
  const height = 8;
  const clamp = value => Math.max(0, Math.min(1, value)) * width;
  return `<svg class="p-bar" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none"
    role="img" aria-label="${label}">
    <rect class="p-bar__track" width="${width}" height="${height}" rx="2"/>
    <rect class="p-bar__fill" width="${clamp(fraction).toFixed(1)}" height="${height}" rx="2"/>
    ${overlay ? `<rect class="p-bar__overlay" width="${clamp(overlay).toFixed(1)}" height="${height}" rx="2"/>` : ''}
  </svg>`;
}

export { compact as compactEuro };
