// One deliberately narrow, reproducible connector. No generic web-price scraping.
export const eurostatMetals = {
  id: 'ESTAT:sts_inppd_m:M.PRC_PRR_DOM.C24.NSA.I21.FI',
  label: 'Finland — manufacture of basic metals, domestic producer prices',
  sourceUrl: 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/sts_inppd_m?lang=EN&freq=M&indic_bt=PRC_PRR_DOM&geo=FI&nace_r2=C24&unit=I21&s_adj=NSA&sinceTimePeriod=2025-01',
  unit: 'Index, 2021=100', currency: 'EUR', geography: 'FI', frequency: 'monthly',
  sourceType: 'producer_price_index',
  publisher: 'Eurostat', datasetDoi: 'https://doi.org/10.2908/STS_INPPD_M',
  licence: 'Eurostat reuse policy',
  licenceUrl: 'https://ec.europa.eu/eurostat/help/copyright-notice',
  attribution: 'Source: Eurostat, sts_inppd_m. Procus reformatted the data and performs its own calculations; Eurostat is not responsible for these transformations or calculations.',
  limitation: 'Broad domestic output-price proxy; not a steel grade price, raw-material €/kg quote, or total part cost.',
};

export function parseEurostatMetals(json, retrievedAt) {
  const expected = { freq: 'M', indic_bt: 'PRC_PRR_DOM', nace_r2: 'C24', s_adj: 'NSA', unit: 'I21', geo: 'FI' };
  if (json?.class !== 'dataset' || !Array.isArray(json.id) || !Array.isArray(json.size) || json.id.length !== 7 || json.size.length !== 7 || new Set(json.id).size !== 7 || !json.id.includes('time')) throw new Error('Expected a single-series JSON-stat dataset');
  for (const [dimension, code] of Object.entries(expected)) {
    const offset = json.id.indexOf(dimension);
    const index = json.dimension?.[dimension]?.category?.index;
    if (offset < 0 || json.size[offset] !== 1 || !index || Object.keys(index).length !== 1 || index[code] !== 0) throw new Error(`Unexpected Eurostat dimension: ${dimension}`);
  }
  const time = json.dimension?.time?.category?.index;
  const count = json.size[json.id.indexOf('time')];
  if (!time || !Number.isInteger(count) || count < 1 || Object.keys(time).length !== count || !json.value || !Number.isFinite(Date.parse(retrievedAt))) throw new Error('Missing observations or retrieval timestamp');
  const entries = Object.entries(time).sort((a, b) => a[1] - b[1]);
  const observations = entries.map(([period, offset], position) => {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period) || offset !== position) throw new Error('Invalid time dimension');
    const value = json.value[offset] ?? null;
    if (value !== null && (typeof value !== 'number' || !Number.isFinite(value) || value <= 0)) throw new Error(`Invalid index value: ${period}`);
    return { period, value, status: json.status?.[offset] ?? null };
  });
  if (!observations.some(row => row.value !== null)) throw new Error('Dataset has no usable observations');
  return { ...eurostatMetals, retrievedAt, providerUpdatedAt: json.updated ?? null, observations };
}

export const statfinEndpoint = 'https://pxdata.stat.fi/PxWeb/api/v1/en/StatFin/thi/13m8.px';
export const statfinDimensions = Object.freeze({
  product: 'cpa_6_20180101', time: 'timeperiod_m',
  market: 'thi_hinkasind_1_20180101', measure: 'contentscode',
});
export const statfinMaterials = Object.freeze([
  Object.freeze({ code: '241', key: 'steel', label: 'Basic iron and steel and ferro-alloys' }),
  Object.freeze({ code: '2444', key: 'copper', label: 'Copper' }),
]);

function statfinPeriod(period) {
  if (typeof period !== 'string' || !/^\d{4}M(0[1-9]|1[0-2])$/.test(period)) throw new Error('Invalid StatFin month');
  return period.replace('M', '-');
}

/** Periods come from current table metadata: unsupported future months are never guessed. */
export function buildStatfinQuery(periods) {
  if (!Array.isArray(periods) || !periods.length || new Set(periods).size !== periods.length) throw new Error('Unique StatFin months required');
  periods.forEach(statfinPeriod);
  const items = (code, values) => ({ code, selection: { filter: 'item', values } });
  return {
    query: [
      items(statfinDimensions.product, statfinMaterials.map(material => material.code)),
      items(statfinDimensions.time, [...periods].sort()),
      items(statfinDimensions.market, ['2']),
      items(statfinDimensions.measure, ['thi-pisteluku21']),
    ],
    response: { format: 'json-stat2' },
  };
}

function dimensionCoordinates(json, name, expectedCodes) {
  const axis = json.id.indexOf(name);
  const count = json.size[axis];
  const category = json.dimension?.[name]?.category;
  const index = category?.index;
  if (axis < 0 || !Number.isInteger(count) || count < 1 || !index || Array.isArray(index) || Object.keys(index).length !== count) throw new Error(`Invalid StatFin dimension: ${name}`);
  const entries = Object.entries(index).sort((a, b) => a[1] - b[1]);
  if (entries.some(([, offset], position) => offset !== position)) throw new Error(`Invalid StatFin coordinates: ${name}`);
  if (expectedCodes && (count !== expectedCodes.length || expectedCodes.some(code => !Object.hasOwn(index, code)))) throw new Error(`Unexpected StatFin dimension: ${name}`);
  const stride = json.size.slice(axis + 1).reduce((product, size) => product * size, 1);
  return { index, entries, stride, category };
}

/** Decode the provider's axis order and category offsets, never the submitted query order. */
export function parseStatfinMaterials(json, retrievedAt) {
  const dimensions = Object.values(statfinDimensions);
  if (json?.class !== 'dataset' || !Array.isArray(json.id) || !Array.isArray(json.size)
      || json.id.length !== 4 || json.size.length !== 4 || new Set(json.id).size !== 4
      || dimensions.some(name => !json.id.includes(name)) || !json.size.every(size => Number.isInteger(size) && size > 0)) throw new Error('Expected the StatFin 13m8 JSON-stat dataset');
  if (!Number.isFinite(Date.parse(retrievedAt)) || !Number.isFinite(Date.parse(json.updated))) throw new Error('StatFin retrieval and provider timestamps required');
  if (Date.parse(json.updated) > Date.parse(retrievedAt)) throw new Error('StatFin provider timestamp is after retrieval');
  if (!json.value || typeof json.value !== 'object') throw new Error('StatFin observations required');
  const product = dimensionCoordinates(json, statfinDimensions.product, statfinMaterials.map(material => material.code));
  const time = dimensionCoordinates(json, statfinDimensions.time);
  dimensionCoordinates(json, statfinDimensions.market, ['2']);
  const measure = dimensionCoordinates(json, statfinDimensions.measure, ['thi-pisteluku21']);
  const sourceUnit = measure.category.unit?.['thi-pisteluku21']?.base;
  if (sourceUnit !== 'index point') throw new Error('Unexpected StatFin measurement unit');
  const observationsCount = json.size.reduce((count, size) => count * size, 1);
  for (const key of Object.keys(json.value)) {
    if (!/^\d+$/.test(key) || !Number.isSafeInteger(Number(key)) || Number(key) >= observationsCount) throw new Error('Invalid StatFin observation offset');
  }
  return statfinMaterials.map(material => {
    const observations = time.entries.map(([sourcePeriod, timeOffset]) => {
      const period = statfinPeriod(sourcePeriod);
      const offset = product.index[material.code] * product.stride + timeOffset * time.stride;
      const value = json.value[offset] ?? null;
      if (value !== null && (typeof value !== 'number' || !Number.isFinite(value) || value <= 0)) throw new Error(`Invalid StatFin index value: ${material.code} ${period}`);
      return { period, value, status: json.status?.[offset] ?? null };
    }).sort((a, b) => a.period.localeCompare(b.period));
    if (!observations.some(row => row.value !== null)) throw new Error(`StatFin ${material.code} has no usable observations`);
    return {
      id: `STATFIN:13m8:${material.code}.2.thi-pisteluku21`,
      key: material.key,
      label: `Finland — ${material.label}, domestic producer-price proxy`,
      sourceUrl: statfinEndpoint,
      sourceType: 'producer_price_index',
      publisher: 'Statistics Finland',
      unit: 'Index, 2021=100', currency: 'EUR', geography: 'FI', frequency: 'monthly',
      classification: 'CPA 2015', productCode: material.code, market: 'domestic',
      sourceDimensions: { [statfinDimensions.product]: material.code, [statfinDimensions.market]: '2', [statfinDimensions.measure]: 'thi-pisteluku21' },
      licence: 'CC BY 4.0', attribution: 'Source: Statistics Finland, producer price indices, table 13m8. Procus reformatted the data.',
      licenceUrl: 'https://stat.fi/en/about-us/get-to-know-statistics-finland/legislation/terms-of-use',
      limitation: 'Domestic product-group producer-price proxy, not a material grade quotation or commodity EUR/kg price. BOM mapping requires explicit review.',
      retrievedAt, providerUpdatedAt: json.updated, observations,
    };
  });
}
