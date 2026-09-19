export function problem(message, status = 400) { return Object.assign(new Error(message), { status }); }
export function text(value, label, max = 1000) {
  if (typeof value !== 'string' || !value.trim() || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) throw problem(`Invalid ${label}`);
  return value.trim();
}
export function emailAddress(value) {
  if (typeof value !== 'string' || value.length > 254 || !/^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9.-]*[A-Z0-9])?\.[A-Z]{2,}$/i.test(value)) throw problem('Invalid email address');
  return value;
}
export function sourceUrl(value) {
  let url;
  try { url = new URL(value); } catch { throw problem('Invalid source URL'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || value.length > 2000) throw problem('Invalid source URL');
  return url.href;
}
export function candidates(value) {
  if (!Array.isArray(value) || value.length > 5) throw problem('Expected at most five supplier candidates');
  return value.map(item => ({ name: text(item.name, 'supplier name', 160), country: text(item.country, 'country', 100),
    website: sourceUrl(item.website), capability: text(item.capability, 'capability', 1500),
    email: item.email ? emailAddress(item.email) : null,
    contactSource: item.email ? sourceUrl(item.contactSource) : null,
    sources: Array.isArray(item.sources) && item.sources.length > 0 && item.sources.length <= 5
      ? item.sources.map(sourceUrl) : (() => { throw problem('Supplier evidence links required'); })(),
    uncertainty: text(item.uncertainty, 'qualification gaps', 1500), qualification: 'unverified',
  }));
}
