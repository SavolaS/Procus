# Procus: technical ambition and the reference-price problem

19 September 2026. This records the founder's instruction to start BOM and raw-material pricing work. The latest demo direction prioritizes visible technical depth and a reproducible automatic workflow; real-time fetching is explicitly unnecessary. It advances that work ahead of the older P2 scheduling proposal. The founder subsequently clarified that pricing must run automatically within the existing procurement and negotiation flow, with no calculator or dedicated pricing tab. This does not lock the product design or expand supplier-message authority.

## Submission wording

Procus is building an evidence-backed pricing engine for industrial procurement. The hard problem is that a finished component has no single publicly observable fair price: its cost depends on material grade, BOM quantities, manufacturing yield, conversion work, order size and commercial terms. Our first implementation automatically connects each supported part’s BOM to public producer-price data, calculates the contribution of each cost exposure, and compares the resulting scenario range with the current purchase price. The finding appears directly in the part evidence and negotiation preparation, explaining why a price warrants review or which evidence is missing. It preserves source snapshots and declines to calculate when evidence is incomplete. The research ambition is to learn which material mappings, cost shares and time lags transfer between parts and suppliers, then test calibrated estimates against simple historical-price baselines. Comparable offers, contractual adjustments and cost scenarios remain distinct evidence. This turns pricing into a testable data and modelling problem rather than asking a language model to invent a target price.

The deterministic engine and public-data connectors are implemented. Learned mappings, calibrated predictive intervals and customer savings are future validation work, not demonstrated results.

## Alignment with the founder pitch

Checked against [procus-pitch.md](../procus-pitch.md), supplied by the founder on 19 September 2026. The product is a procurement co-pilot for the long tail of industrial purchasing, not an analyst-operated pricing calculator.

| Pitch principle | Implementation and boundary |
| --- | --- |
| Continuously monitor the portfolio (§§3–7) | All 49 parts are assessed automatically from bundled evidence. The demo showcases the monitoring decision logic without live fetching or polling. Continuous ingestion and operational monitoring remain product vision, not an implemented demo claim. |
| Detect pricing gaps and prepare actions (§§7–9) | Supported BOMs produce a price-review reason, comparison range and supplier-breakdown request directly in overview, part evidence and negotiation preparation. Missing evidence generates a specific next step instead of an invented price. |
| Use multiple evidence types (§8) | BOM/index cost pressure sits alongside the existing purchase history and illustrative comparable/alternative signals. It does not overwrite or average away their different meanings. Email ingestion, supplier dependency data and live quote acquisition are not implemented in this slice. |
| Framework → opening ask/LAA → optional RFQ (§9) | The incoming negotiation and RFQ flow is preserved. Current example targets remain explicitly illustrative buyer-review inputs; cost scenarios do not automatically set a mandate or agreement. LAA and model details stay out of supplier-facing copy. |
| Preserve the buyer relationship (§10) | Procus prepares evidence and editable supplier drafts; the buyer controls negotiation and supplier selection. No autonomous messages or purchase commitments are introduced. |
| One coherent demo (§11) | The aluminium SKU retains the pitch's +12%/+3%/−8%/−11% and −10% opening/−6% LAA example, explicitly labelled illustrative. The +3% aluminium example is not passed into the sourced engine as real market data. Real StatFin-backed steel/copper examples demonstrate actual calculation separately. |

The technical ambition belongs inside this workflow: moving from portfolio data to justified action with less buyer work. A separate calculator tab was removed following the founder's clarification.

## What the reference price means

| Question | Evidence | Output | Implementation in this slice |
| --- | --- | --- | --- |
| Does the current purchase price warrant review against its cost exposure? | Baseline price, explicit BOM input costs, index observations and scenario assumptions | Automatic review/no-gap/missing-evidence decision with cost range and contribution breakdown | Implemented in `src/automatic-pricing.js` and `src/pricing.js` |
| Which source series actually exist and have usable observations? | Provider dimensions, observations, missing flags and retained snapshots | Traceable monthly index series | Eurostat and Statistics Finland connectors |
| What price does this contract require? | Reviewed index clause, lag, averaging window, coefficients, caps and effective dates | Contractual adjustment | Not implemented; generic scenario arithmetic is not contract interpretation |
| What can this buyer actually purchase at comparable terms? | Current offers, quantity tiers, part/site approval, freight, validity and availability | Individually qualified comparable offers | Deterministic eligibility/normalization engine implemented with illustrative fixtures; no live supplier offers |
| What did this buyer previously pay? | Matched invoices, same revision and normalized terms | Historical anchor | Normalized historical fixtures remain separate; no customer data ingested |

Do not blend these into a single average. A material decline and an expired low quote do not establish an attainable saving. The research agents found established solutions for individual ingredients; the hypothesis to prove is more reliable, lower-effort decision preparation on sparse industrial data. [Detailed comparison research](reference-price-methods.md).

## Implemented calculation

For each material, the caller declares **net mass per good part**, manufacturing yield, purchase price per kg and scrap recovery assumptions:

```text
gross material = net material / yield
purchase cost = gross material × price per kg
scrap credit = (gross material − net material) × recovered fraction × scrap price

scenario price = baseline purchase price
               + Σ signed baseline cost × pass-through × (index/FX ratio − 1)
```

Material cost is expressed per good part in the baseline purchase currency. It is not inferred from a material's mass percentage. Scrap credits have their own negative contribution; credit and material must not be counted twice. Processing, overhead and supplier margin are not independently estimated: the unmodelled portion of the baseline purchase price stays fixed and is displayed as a residual.

The engine accepts explicit monthly lag and averaging windows. For foreign-currency drivers it converts matched monthly observations before averaging; the FX direction is baseline currency per exposure currency. This monthly convention is not an exact average of daily converted prices and must not be substituted for a different contractual convention. The low/central/high values vary declared pass-through assumptions; they are **scenario bounds, not calibrated prediction intervals**. Independent per-driver bounds may include combinations that a future joint model would rule out.

Inputs must have a baseline source and BOM revision, driver cost source and mapping rationale, series identity, currency, geography, unit and capture timestamp. Missing observations, duplicate months, incompatible FX direction and inconsistent costs block the numeric result. A recently retrieved historical series cannot establish what was known before retrieval: point-in-time backtesting requires older retained snapshots. Observation flags remain in calculation evidence; the first engine does not independently adjudicate every publisher's break/provisional flag.

## Real data and synthetic demonstration

The automatic portfolio assessment uses saved Statistics Finland domestic producer-price series for supported steel and copper BOM records. These are **output-price index points**, not a material grade’s EUR/kg purchase price. Example BOM quantities, baseline material costs, mapping rationale and pass-through assumptions live in versioned records in `src/bom-data.js`, not in a user calculator. Unsupported parts such as the aluminium housing receive an explicit missing-evidence result instead of inheriting a steel index.

The current portfolio spans October 2025–September 2026. Its automatic cost model compares the October baseline purchase price with the September current price using an explicit illustrative two-month index lag: August 2025 to July 2026 index observations. This keeps purchase-price dates and input-cost dates distinct. It does not relabel July statistics as September observations. The first policy requests review only if the current price exceeds the scenario’s upper bound by more than the greater of EUR 0.01 and 1% of the current price. That is an explicit prototype policy, not a statistically learned threshold or proof of overcharging.

The three result states are `review_price`, `no_cost_gap` and `insufficient_evidence`. A price-review result provides a reason to request a breakdown or updated quotation. A no-gap result means the selected cost evidence does not support a reduction; it does not rule out other commercial negotiating opportunities. Missing BOMs, mappings, observations or source files block a numeric estimate. Model gaps remain separate from the prototype’s existing commercial targets and savings totals.

Source: [Eurostat industrial producer prices](https://doi.org/10.2908/STS_INPPD_M), accessed 19 September 2026. BOM values and transformations are Procus examples; Eurostat is not responsible for these calculations. See [Eurostat reuse rules](https://ec.europa.eu/eurostat/help/copyright-notice). Statistics Finland data are attributed under its [CC BY 4.0 terms](https://stat.fi/en/about-us/get-to-know-statistics-finland/legislation/terms-of-use). Exact endpoints, observed limitations and licensed alternatives are in [index-source research](pricing-indices.md).

## Run and inspect

```sh
npm run pricing:fetch          # Refresh Eurostat snapshot; preserve raw response by SHA-256
npm run pricing:fetch:statfin   # Retrieve Finnish steel and copper product indices
npm run pricing:analyze        # Developer diagnostic: all automatic part findings
npm run pricing:analyze -- NF-101 # Inspect one complete evidence record
npm test
npm run dev                   # Analysis appears automatically in existing views
```

Provider fetches are explicit developer commands. The browser requests `/api/pricing-analysis` on startup. The server evaluates bundled snapshots and shares the resulting cached analysis across requests. No timer or external request is needed to demonstrate the pipeline. Restarting the server picks up changed snapshots and BOM records. The service does not claim a continuously live market feed. A failed refresh must not replace the last successful dataset. Provider payload hashes preserve content identity; retrieval timestamps identify captures, not fabricated historical publication dates. The prototype's original portfolio, agreement and savings figures remain fictional and are not overwritten by cost scenarios.

## The next research and engineering milestones

1. **Customer-approved material mapping.** Select one process family with actual BOM revisions, gross/net mass conventions, baseline material invoices and purchasing terms. Capture grade, shape, regional premium, supplier geography and index applicability. Record accepted and rejected mappings, including reviewer and effectivity. Test exact unit/revision mismatches and unknowns before allowing part-level comparisons.
2. **Comparable-price validation with customer data.** The first deterministic engine implements eligibility gates and cost normalization on fixtures; validate and extend it using in [the reference-price research](reference-price-methods.md): revisions, quantities, price denominators, order multiples, currency, site approval, validity, logistics and one-time charges. Show excluded offers with reasons. History and catalogue observations cannot become executable quotes through normalization alone.
3. **Cost bridge and nested BOM.** Add versioned BOM rollup, choose purchased subassembly versus manufactured children, and prevent double counting. Model process routes, energy, labour, setup, freight, scrap and premiums only when sourced. Keep markup and margin conventions explicit. [Costing equations and sparse-data fallbacks](bom-costing.md).
4. **Learned lag and pass-through.** Compare constrained category/supplier models against last paid price, category median and a single-index adjustment. Use forward-in-time splits plus held-out suppliers/part families. Preserve information available at each decision date; no random split of revised time series. A correlated index is not proof of a supplier's cost structure.
5. **Calibrated uncertainty and evidence requests.** Measure error, interval width, coverage and abstention by category and input quality. Identify whether a missing mass, freight quote or supplier breakdown most changes the decision. Do not label hand-picked scenarios P10/P90. Test whether targeted evidence requests reduce buyer work and clarification rounds.

Acceptance for the first slice is reproducible calculation and visible limitations, not achieved procurement savings. The pilot should report wrong-match rates, abstention coverage, buyer correction time and prediction error against the baselines before any accuracy or uniqueness claim. Booked savings still require an agreement and matched purchasing evidence.
