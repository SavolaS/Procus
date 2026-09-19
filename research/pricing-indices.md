# Raw-material and producer-price data for Procus

Research date: 19 September 2026. Primary sources and public endpoints were checked during this task. Recommendations below are implementation proposals, not claims that an index is a supplier quotation.

## Recommendation

Start with **Eurostat's JSON Statistics API**, then add **Statistics Finland's PxWeb API** for narrower Finnish product groups. Both were retrieved successfully without credentials and work with dependency-free Node `fetch`. Eurostat is the quickest European connector; Finland gives more procurement-relevant product detail, including copper and corrugated packaging. Add **ECB monthly FX** when introducing USD-denominated commodity prices. Use the World Bank Pink Sheet as a later commodity-price connector, with its workbook format and dataset-specific redistribution rights explicitly handled.

This solves access to defensible **price movements**. It does not identify the fair absolute purchase price of an engineered part. Use approved BOM material quantities, customer-provided baseline material costs or cost shares, and a justified index mapping. A producer-price index can include fabrication, energy, labour and margin; applying it as a raw-material input and separately escalating those same costs can double-count movement. Keep this model-derived reference separate from valid comparable quotes and contractual adjustment calculations.

## Sources and access

| Source | Useful coverage and unit | Frequency / practical availability | Access and use | Main limitation |
| --- | --- | --- | --- | --- |
| Eurostat industrial producer prices | EU/member-state industry output prices; selected series is Finland basic metals, index 2021=100 | Monthly; selected Finnish series had values through July 2026 on 19 September | Public JSON-stat API, HTTP 200 verified; commercial reuse with attribution subject to listed exceptions | Industry aggregate, not an alloy/grade/form price; sparse observations, country-specific revision practices |
| Statistics Finland 13m8 | Finnish product groups, domestic/export/import and domestic-supply variants; index 2021=100 | Monthly; response updated 24 August 2026, latest reference month July | Public PxWeb metadata GET and data POST, HTTP 200 verified; CC BY 4.0 | Some detailed cells are missing; a listed classification is not evidence of an available series |
| ECB EXR | USD per EUR reference FX; daily or monthly average variants | Monthly series returned June–August 2026 | Public CSV/SDMX API, HTTP 200 verified; attribution and preservation of original statistics/metadata | Informational FX, not a company's executed or hedged rate; FX direction and aggregation must be explicit |
| World Bank Pink Sheet | Commodity-specific nominal USD price series plus composite indices; benchmark geography and physical units vary by commodity | Monthly publication; September issue describes August; observed next update 2 October | Public XLSX binary HTTP 200 verified; landing page links use and licensing policies | Workbook parsing, benchmark basis mismatch, historical revisions and dataset/third-party reuse review |
| LME | Exchange-specific metal grades and delivery basis; cash/forward definitions matter | Product/feed-specific | Commercial licensed feed/distributor | Display, non-display, derived values and redistribution are distinct licensing uses |
| MEPS | Steel product/form and regional assessments; narrower than broad PPI | Monthly assessments | Licensed portal/publications; no open API was verified | Product extras, long-term contracts and buyer size affect comparability; ordinary user licence is not SaaS redistribution permission |
| ICIS | Chemical/polymer/energy specification and region-specific price assessments | Depends on assessment | Official paid Data Express/API and authorised-user developer routes | Website scraping is prohibited by published terms; API/customer entitlements and derivative use must match the product |

Sources: [Eurostat API guide](https://ec.europa.eu/eurostat/web/user-guides/data-browser/api-data-access/), [Eurostat reuse rules](https://ec.europa.eu/eurostat/help/copyright-notice), [Statistics Finland API guide](https://stat.fi/en/services/statistical-data-services/open-data-and-interfaces/interface-use-of-databases), [Statistics Finland terms](https://stat.fi/en/about-us/get-to-know-statistics-finland/legislation/terms-of-use), [ECB API examples](https://data.ecb.europa.eu/help/api/data-examples), [ECB reuse policy](https://www.ecb.europa.eu/stats/ecb_statistics/governance_and_quality_framework/html/usage_policy.en.html), [World Bank commodity data](https://www.worldbank.org/en/research/commodity-markets).

## 1. Eurostat: first connector

Verified request:

```text
GET https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/sts_inppd_m?lang=EN&geo=FI&nace_r2=C24&unit=I21&s_adj=NSA&sinceTimePeriod=2026-01
```

The response's complete series dimensions are:

| Dimension | Value | Meaning |
| --- | --- | --- |
| freq | M | Monthly |
| indic_bt | PRC_PRR_DOM | Domestic producer prices |
| nace_r2 | C24 | Manufacture of basic metals |
| s_adj | NSA | Neither seasonally nor calendar adjusted |
| unit | I21 | Index, 2021=100 |
| geo | FI | Finland |

Production requests should include `freq=M&indic_bt=PRC_PRR_DOM` explicitly. Retain all dimensions as part of series identity. The response had `updated: 2026-09-17T11:00:00+0200`; January–July values were `100.6, 100.9, 102.8, 103.9, 107.2, 107.5, 108.0`. **The time dimension included August but there was no August entry in the sparse `value` object.** Decode missing keys as unavailable, never zero and never silently carry July forward as August.

The selected request is directly [reproducible](https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/sts_inppd_m?lang=EN&geo=FI&nace_r2=C24&unit=I21&s_adj=NSA&sinceTimePeriod=2026-01). The dataset DOI is [10.2908/STS_INPPD_M](https://doi.org/10.2908/STS_INPPD_M).

Other industry groups, countries and domestic/non-domestic series should be discovered and validated against metadata before mapping. Never silently substitute C24 for a precise aluminium, stainless-steel or copper purchasing specification. The [STS metadata](https://ec.europa.eu/eurostat/cache/metadata/EN/sts_esms.htm) specifies monthly producer-price transmission deadlines of one month after reference period; actual series coverage must still be checked. [Country-specific documentation](https://ec.europa.eu/eurostat/cache/metadata/EN/sts_ind_pric_esms_es.htm) shows revisions can occur, including rebasing and methodological changes; do not assume all countries use Finland's non-revision practice.

Commercial reuse is allowed for these Finnish statistics with source attribution. The Eurostat policy has exceptions, including some non-European-country and third-party data; avoid granting every future Eurostat series the same rights automatically. Label Procus transformations as such and retain the required attribution/non-responsibility notice when modifying data. [Reuse rules](https://ec.europa.eu/eurostat/help/copyright-notice).

## 2. Statistics Finland: more specific material/product proxies

Verified metadata endpoint:

```text
GET https://pxdata.stat.fi/PxWeb/api/v1/en/StatFin/thi/13m8.px
```

Verified POST to the same endpoint with `Content-Type: application/json`:

```json
{
  "query": [
    {"code":"cpa_6_20180101","selection":{"filter":"item","values":["24","241","2444","1721","2222"]}},
    {"code":"timeperiod_m","selection":{"filter":"item","values":["2026M01","2026M07"]}},
    {"code":"thi_hinkasind_1_20180101","selection":{"filter":"item","values":["2","5"]}},
    {"code":"contentscode","selection":{"filter":"item","values":["thi-pisteluku21"]}}
  ],
  "response":{"format":"json-stat2"}
}
```

Product codes tested: `24` basic metals; `241` basic iron/steel/ferro-alloys; `2444` copper; `1721` corrugated paper/paperboard and containers; `2222` plastic packing goods. Series `2` means domestic manufactured-goods producer prices; `5` means import prices. Choose based on the actual purchased input's market, not the buyer's address alone.

Selected results from the verified response:

| Product | Series | January 2026 | July 2026 |
| --- | --- | ---: | ---: |
| Basic metals | Domestic producer | 100.6 | 108.0 |
| Basic metals | Import | 87.5 | 95.2 |
| Copper | Domestic producer | 137.2 | 147.9 |
| Copper | Import | 142.0 | 153.8 |
| Corrugated paper / containers | Domestic producer | 120.2 | 124.2 |
| Plastic packing goods | Import | unavailable | unavailable |

These are index points, not EUR/kg. The separately tested aluminium code `2442` returned null for both months and both selected series. Missing status was `.`. **Returned category order differed from request order**, so flatten coordinates using `id`, `size`, and each `dimension.category.index`; never zip values onto the request's product array.

The June 2026 database restructuring shortened paths and changed variable codes. Old snippets with `StatFin__thi/statfin_thi_pxt_13m8.px` are not a reliable implementation template. The [current API page](https://stat.fi/en/services/statistical-data-services/open-data-and-interfaces/interface-use-of-databases) explicitly announces this change. Discover the current table with [the live root](https://pxdata.stat.fi/PxWeb/api/v1/en/StatFin/thi), then fetch metadata.

The [producer-price documentation](https://stat.fi/en/documentation/documentation-of-statistics/thi) says publication is monthly and these producer-price indices are not revised after publication. Still store source snapshots and detect structural/base changes. [CC BY 4.0 terms](https://stat.fi/en/about-us/get-to-know-statistics-finland/legislation/terms-of-use) explicitly permit commercial combination, adaptation and redistribution with attribution.

## 3. ECB FX: preserve direction and period basis

Verified CSV:

```text
GET https://data-api.ecb.europa.eu/service/data/EXR/M.USD.EUR.SP00.A?startPeriod=2026-06&endPeriod=2026-08&format=csvdata
```

The series key is monthly (`M`), USD, EUR denominator, spot (`SP00`), average (`A`). Returned values were June `1.1518`, July `1.1417478260869562`, August `1.1593095238095241` USD per EUR. Thus `EUR price = USD price / USD_per_EUR`. A price ratio in EUR is `(USD_price_t / FX_t) / (USD_price_0 / FX_0)`. Do not apply FX again to a domestic-currency producer-price ratio without a clearly defined economic reason.

These are verified response observations and the conversion formulas are Procus calculations. A monthly-average commodity price divided by a monthly-average FX rate is an approximation to an average of daily converted prices; preserve that method name. A contract may specify a different averaging period, lag or currency hedge. [API documentation](https://data.ecb.europa.eu/help/api/data-examples); [reuse policy](https://www.ecb.europa.eu/stats/ecb_statistics/governance_and_quality_framework/html/usage_policy.en.html). Keep the original ECB observation intact and distinguish derived Procus calculations from ECB statistics.

## 4. World Bank Pink Sheet: useful second-stage commodity source

The current [commodity-market page](https://www.worldbank.org/en/research/commodity-markets) linked the following workbook, retrieved successfully as 586,735 bytes with XLSX content type:

```text
https://thedocs.worldbank.org/en/doc/74e8be41ceb20fa0da750cda2f6b9e4e-0050012026/related/CMO-Historical-Data-Monthly.xlsx
```

The linked resource path includes an opaque document/version identifier. Resolve it from the official source page or catalog rather than assuming it will remain permanent. A direct command-line fetch of the main HTML page returned 403 during this task, while the official linked workbook returned 200. No access-control bypass was attempted. The workbook was downloaded into memory to verify access, but its cells were not parsed here; exact present-day commodity columns and unit metadata still need validation in the connector work.

The page linked both dataset terms and a [data-access/licensing page](https://datacatalog.worldbank.org/public-licenses). The old dataset-terms URL redirected to general terms, which themselves distinguish datasets from other website material. This research therefore **does not declare the entire Pink Sheet or its upstream third-party content cleared for commercial redistribution**. Record the applicable dataset licence and exceptions before bundling observations in a distributed product. This is a narrower unresolved question than whether the file is publicly downloadable. [World Bank permissions](https://www.worldbank.org/en/about/legal/permissions); [current terms](https://www.worldbank.org/ext/en/legal/terms-conditions).

## 5. Commercial upgrades when category fit requires them

**LME:** the provider explicitly offers distinct derived-data, non-display, usage and distribution licences. Procus's reference-price calculations could fall within derived reference values or research/analytics, so a website quote or customer's ordinary subscription is not enough to infer rights for a multi-tenant product. Select the contract, metal grade, currency, prompt date and regional premium independently. [Licensing overview](https://www.lme.com/Market-data/Market-data-licensing), [derived-data categories](https://www.lme.com/market-data/market-data-licensing/derived-data). No commercial feed was accessed or licensed in this task.

**MEPS:** useful for product-form-specific steel comparisons. Its methodology covers newly produced prime commercial material negotiated in the current month for forward delivery, and permits correction of publication errors. Ordinary user licences restrict access to licensed users; absent a documented multi-user arrangement the terms describe a single-user licence. A SaaS integration requires its own granted rights and delivery arrangement. [Methodology](https://mepsinternational.com/gb/en/pages/meps-research-methodology), [licence terms](https://portal.mepsinternational.com/terms-and-conditions/), [monthly products](https://mepsinternational.com/gb/en/monthly-steel-reviews). No freely accessible API endpoint was established.

**ICIS:** use its official [Data Express API](https://www.icis.com/explore/services/dataexpress/icis-api/) for licensed chemical/polymer coverage. The provider advertises dataset selection, unit/currency flexibility and identification of updated series. Public [developer documentation](https://developer.icis.com/docs/energyapi/1/routes/dataEvents/get) provides an energy event endpoint and cursor pagination; that is evidence of integration support, not access to chemical prices or entitlement. [Global terms](https://www.icis.com/explore/terms/global-terms-and-conditions/) and [acceptable-use policy](https://www.icis.com/explore/terms/icis-clarity-acceptable-use-policy/) prohibit unauthorised scraping. No subscription, account or scraping of licensed material was attempted.

## Connector acceptance criteria

These are Procus engineering recommendations derived from the observed data issues:

1. Store publisher, series key and all dimensions; classification version; unit/base year; currency if applicable; product specification; geography; market and price basis; cadence and averaging method; source URL; licence/attribution; retrieval and publisher timestamps.
2. Store each observation's reference period, numeric value or explicit missing state, status flags, source snapshot hash, and available publication timestamp. Retrieval time is not a fabricated historical publication date.
3. Fail closed on empty data, unknown dimensions, changed units/base, duplicate periods, non-finite values and non-positive ratio denominators. Preserve provisional/break flags for downstream decisions. Do not silently interpolate or relabel periods.
4. Cache and bound official API queries. Ingest centrally rather than letting every browser repeatedly query publishers; retain provenance and source failures alongside the last successful snapshot.
5. The same observation snapshot must reproduce a previous decision. Refreshes create versions; they must not silently rewrite the evidence behind an agreed negotiation.
6. A BOM-to-index mapping needs an explicit reviewer and scope statement. Copper PPI is a proxy for a copper-containing part's relevant cost component, not proof that its full supplier price should move by the same percentage.
7. Use a historical as-of cutoff for backtests. Only data that were available by that decision date belong in the calculation; present-day revised histories cannot establish that automatically.

An achievable first technical milestone is an explainable reference interval for one approved material mapping, backed by live-source snapshots, with a visible residual for unknown costs and a blocked result when required observations are unavailable. Broader material coverage and more specific commercial indices can then be evaluated against actual customer purchasing categories.
