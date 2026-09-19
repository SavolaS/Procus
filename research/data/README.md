# Public pricing-source snapshots

These files contain public statistics, not customer BOMs or negotiated prices. Data were retrieved on 19 September 2026; exact capture timestamps and provider update timestamps are retained in parsed snapshots.

- **Eurostat:** [Industrial producer prices, sts_inppd_m](https://doi.org/10.2908/STS_INPPD_M), Finnish basic-metals domestic output prices, index 2021=100. [Reuse policy](https://ec.europa.eu/eurostat/help/copyright-notice). Source values are retained; schema normalization and derived cost scenarios are Procus transformations. Eurostat is not responsible for these transformations.
- **Statistics Finland:** [Producer price indices, table 13m8](https://pxdata.stat.fi/PxWeb/api/v1/en/StatFin/thi/13m8.px), Finnish domestic steel and copper product indices, 2021=100. Source: Statistics Finland. [CC BY 4.0 terms](https://stat.fi/en/about-us/get-to-know-statistics-finland/legislation/terms-of-use). Parsed file structure is a Procus adaptation; observations are not altered or interpolated.

The `*-fi-*.json` aliases hold the latest retrieved, validated series. Raw payload and parsed-vintage filenames include SHA-256 hashes; a repeated payload preserves its first retained vintage. StatFin also retains the metadata response and exact POST query. Refresh commands run explicitly from the repository root. They do not establish an automatic feed or historical availability before the retained capture date.

Both datasets are producer-price indices. They are not absolute raw-material prices or executable quotations. A classification's existence does not guarantee a populated observation. Missing observations and provider status flags are retained.
