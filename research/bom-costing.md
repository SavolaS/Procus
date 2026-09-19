# BOM and raw-material reference pricing: costing method

Research date: 19 September 2026. Scope: manufacturing should-cost and historical price adjustment. This is an implementation proposal, not a validated estimate of any supplier's costs. All worked numbers below are synthetic.

## Recommendation

Build a reproducible reference-price engine with **separate result types**: contractual adjustment, indexed historical price, engineering cost scenario, and comparable supplier quote. A commodity decline cannot establish the achievable price of a finished component. The first usable engine should support indexed baselines and physical BOM scenarios independently, with typed units, versioned evidence, missing-data gates and explicit uncertainty. Avoid collapsing their results into an opaque weighted average.

The difficult work is translating a supplier-specific material and process structure into defensible exposures. Retrieving a metal price is a small part of that work. Cost exposure, manufacturing yield, material grade and form, geography, premiums, conversion operations, purchasing dates and commercial terms determine whether the retrieved series is useful.

## What the primary sources establish

- **BLS:** a PPI measures changes in producers' selling prices; it does not directly measure production costs or publish a unit purchase price. Price-adjustment guidance supports multiple weighted input indexes, precise series identifiers, explicit base periods and data-vintage policies. A related index may be a proxy when the exact input is unavailable. This supports a traceable index calculator, not conversion of an index level into €/kg. [BLS price adjustment guide](https://www.bls.gov/ppi/publications/price-adjustment-guide-for-contracting-parties.htm).
- **DOE:** its PV benchmark model distinguishes a sustainable modeled price from current modeled market prices, uses intrinsic component units, models fixed and variable costs, and records market distortions explicitly. Its collection of actual stakeholder cost data illustrates why a generic public index is insufficient for a supplier-specific cost structure. This is methodological evidence from a different sector, not a transferable metal-parts benchmark. [DOE cost benchmarks](https://www.energy.gov/cmei/systems/solar-photovoltaic-system-cost-benchmarks).
- **UK Infrastructure and Projects Authority:** estimates should document assumptions, scope and uncertainty; early estimates can use deterministic scenarios, while probabilistic methods with immature data can imply false confidence. Apply that principle to procurement by showing assumption ranges, not an unsupported statistical confidence percentage. [Cost estimating guidance](https://www.gov.uk/government/publications/cost-estimating-guidance/cost-estimating-guidance).
- **ECB:** reference currencies are quoted against EUR; the rates are informational, not transaction rates. Use them as an explicit benchmark conversion unless the contract or available invoice evidence supplies the applicable rate. [ECB reference rates](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html).

## Proposed deterministic method A: indexed historical price

Use this when a comparable historical purchase/quote price and defensible exposure shares exist. It answers: “What would that baseline price become under these cost movements and pass-through assumptions?” It does not prove that the baseline was competitive.

```text
P(t) = P(0) × [u + Σ w(k) × {1 + α(k) × [R(k,t) − 1]}]
u = 1 − Σ w(k)
R(k,t) = A(k,t) / A(k,0)
```

Definitions:

- `P(0)` is the baseline price, for one stated purchase unit, currency, specification, volume tier and commercial scope.
- `w(k)` is an exposure share of **baseline purchase price**, not mass and not automatically a share of manufacturing cost. Require `0 ≤ w(k) ≤ 1` and `Σw(k) ≤ 1`.
- `u` is the explicitly unadjusted residual. It can include unmodeled conversion, overhead and profit; do not call it a verified fixed cost.
- `α(k)` is the assumed pass-through fraction, between 0 and 1 in this MVP. Unknown pass-through is an assumption range, not silently 100%.
- `A(k,t)` is the applicable average index/price exposure after the chosen lag, window, currency treatment and vintage selection. The base uses the same policy.

For a monthly observation series `I` in a source currency and a rate `F` defined as target-currency units per source-currency unit:

```text
A(k,t) = Σ[j=0..W−1] I(k,t−L−j) × F(k,t−L−j) / W
```

Use `F = 1` where no separate FX exposure is justified. Do not apply FX to a domestic EUR price index simply because the underlying commodity trades internationally; that can double count exchange-rate effects. Average the paired converted observations when the intended measure is an average local-currency cost. A ratio of independent means is a different policy and must be named if required by a contract.

`L` is procurement lag in months; `W` is the trailing averaging window in months. These are model inputs grounded in contracts or purchasing practice, not universal economic constants. The latest published observation may concern an earlier reference period; publication lag is distinct from procurement lag. If required observations are absent, return missing-data status instead of quietly shortening the window.

If cost breakdown shares instead sum to manufacturing cost `C(0)`, use `w(k) = C(k,0) / P(0)` only when that cost and the purchase-price scope are reconciled. Otherwise show `C(t)/C(0)` as modeled **cost movement**, without labeling it purchase-price movement. Under a separately declared constant-markup scenario, a cost ratio can scale a baseline price, but that margin assumption must be visible.

For an actual contractual clause, run the agreed formula, rounding, caps, floors, anniversary schedule and publication policy exactly. Do not inject discretionary pass-through or new FX terms. Label the answer “contract formula calculation”; do not equate it to an engineering fair price.

### Synthetic indexed example

Baseline price is €100/unit. Exposures are material 40%, labor 20%, energy 5%, with 35% left unadjusted. Applicable ratios are 0.80, 1.05 and 1.10. Full assumed pass-through gives:

```text
100 × (0.35 + 0.40×0.80 + 0.20×1.05 + 0.05×1.10) = €93.50
```

At 80% material pass-through, keeping the other assumptions unchanged, it becomes €95.10. The raw material's 20% decline produces a 4.9–6.5% modeled purchase-price decrease across these two scenarios. This range is an assumption envelope, not an 80% confidence interval, and not evidence of an available supplier offer.

## Proposed deterministic method B: physical BOM and process model

Use this when physical inputs and process assumptions are available. A minimal model for material `i`, per accepted finished unit, is:

```text
grossMass(i) = netMass(i) / materialYield(i)
recoveredMass(i) = [grossMass(i) − netMass(i)] × recoveryFraction(i)
materialCost(i,t) = grossMass(i) × inputPrice(i,t)
                    − recoveredMass(i) × scrapCreditPrice(i,t)

processCost(j,t) = laborHours(j) × laborRate(j,t)
                  + machineHours(j) × machineRateExcludingLaborAndEnergy(j,t)
                  + energyKWh(j) × energyPrice(j,t)
                  + consumables(j,t)

C(t) = Σ materialCost + Σ processCost + purchasedComponents
       + overhead + setupCost/batchQuantity + toolingAllocation
       + qualityCost + packaging + includedLogistics
```

`materialYield` here means retained material divided by material purchased/consumed per accepted unit. It is **not** a general production acceptance yield. In the first model, assume no rejected parts unless gross consumption and operations are explicitly given per accepted unit. A later routing model can incorporate stage-specific rework and rejection yields; dividing every cost by one global defect rate risks charging for operations that rejected parts never reached.

Scrap recovery is physical recoverability and ownership, not the price of virgin metal. Require evidence that the supplier retains scrap proceeds; customer-owned material, returns and supplier contract terms can change the credit. If recovery or scrap prices are unknown, model a separate scenario rather than automatically crediting all offcut at the input price.

Machine rates often embed labor, energy or overhead. Every rate therefore declares included categories. Reject overlapping coverage; otherwise a detailed-looking model can double count costs. Setup is allocated to the quoted batch; dedicated tooling is allocated to explicitly supported units or shown as a one-off charge. Volume reductions can raise unit cost even when commodity prices fall.

Where an absolute material purchase price exists, use €/kg directly. Where only an index exists, reprice a verified base material price with a ratio. Grade/form/location premiums remain separately evidenced amounts or indexed exposures. Do not calculate a steel billet or specialty stainless purchase price from the elemental composition multiplied by pure metal spot prices and call it a supplier benchmark.

Keep cost and selling-price conversion separate:

```text
priceWithMarkup = C × (1 + markupOnCost)
priceWithGrossMargin = C / (1 − grossMarginOnSales)
```

A 20% markup is not a 20% gross margin. No industry-wide “normal supplier profit” should be inserted silently. Show a cost-only result if margin has no defensible basis; labeled margin scenarios can explore possible selling prices.

### Synthetic physical example

One illustrative machined part has 0.4 kg net material and 80% material yield, therefore 0.5 kg gross input. At €3/kg input, 90% recovery of 0.1 kg offcut, and €1/kg scrap credit, material cost is `0.5×3 − 0.1×0.9×1 = €1.41`.

| Cost element per accepted unit | Baseline | Scenario |
| --- | ---: | ---: |
| Material, after scrap credit | €1.410 | €1.110 |
| Labor: 0.05 h × €30/h, then +5% | €1.500 | €1.575 |
| Machine: 0.1 h × €20/h, excluding labor/energy | €2.000 | €2.000 |
| Energy: 0.5 kWh × €0.20/kWh, then +10% | €0.100 | €0.110 |
| Overhead | €0.800 | €0.800 |
| Setup allocation: €20 / 100 units | €0.200 | €0.200 |
| Included logistics/packaging | €0.300 | €0.300 |
| **Modeled cost** | **€6.310** | **€6.095** |
| **Price at assumed 20% markup** | **€7.572** | **€7.314** |

The scenario assumes raw input declines 20% to €2.40/kg, while scrap credit stays €1/kg. The modeled price declines about 3.41%. Material cost share of baseline modeled cost is 22.35%, despite the part being physically 100% metal. Physical mass composition is therefore not a finished-price exposure share. These invented rates are only a calculator fixture, not a market quotation.

## Minimum implementation contract

Recommended objects, with evidence on each observed or assumed input:

| Object | Required fields |
| --- | --- |
| `ComparisonBasis` | part ID, specification/revision, currency, purchase unit, quantity/tier, Incoterm/location, freight/tax/tooling inclusions, payment basis, relevant date |
| `Evidence` | source URL or private file ID and location, retrieval date, applicable date, owner, observed/assumed status, review state, redistribution/license status |
| `Series` | provider, exact series ID, title, index-vs-absolute-price type, units, currency if meaningful, geography, grade/form, frequency, adjustment policy, source evidence |
| `Observation` | series ID, reference period, value, published-at, retrieved-at, vintage, preliminary/revised status; retain immutable snapshots |
| `IndexedExposure` | driver ID, baseline purchase-price share, series mapping, base/target periods, lag, averaging window, FX policy, pass-through scenario, mapping reason and evidence |
| `BomLine` | parent/revision, material/grade/form, net/gross quantity and unit, yield convention, recovery and scrap ownership, base material rate, price evidence |
| `ProcessLine` | operation, quantities/time, labor/machine/energy rates, included cost categories, batch assumptions, evidence |
| `ModelResult` | method, model version, input snapshot IDs, as-of date, basis, baseline/low/central/high results, per-driver contributions, missing inputs, exclusions, warnings |

Reject nonfinite numbers, negative costs/quantities except explicitly typed credits, zero/negative index denominators, yields outside `(0,1]`, recovery outside `[0,1]`, pass-through outside its supported range, exposure sums above 1, incompatible dimensions, cyclic BOMs and unsupported unit conversions. Keep material tonnes distinct from short tons; convert before multiplication. Do not coerce missing data to zero.

Separate a baseline purchase's date from the index base period, model target period, quote validity, and as-of knowledge date. An observation published after an as-of date is unavailable for that historical calculation. A revised series can change a recomputed answer; retain the original result and show a new version.

## Missing BOM and uncertainty behavior

1. **Comparable live quote available:** show the quote and comparison conditions. BOM adds explanation; it should not override a technically qualified offer by averaging it with a weaker proxy.
2. **Baseline plus defensible exposure breakdown:** show an indexed baseline, including its residual and scenario range.
3. **BOM plus plausible route/rates:** show an engineering cost scenario; distinguish observed, supplier-provided and inferred inputs.
4. **Category profile only:** show a sensitivity scenario with the category profile and its limitations. Prioritize asking for the two or three inputs driving most uncertainty.
5. **Commodity index only:** show commodity movement as context. Return no part-level reference price.

Initially use coherent named scenarios rather than independently combining every parameter minimum: low yield and low machine time may be physically inconsistent. Run one-at-a-time sensitivities to identify valuable next questions. “Confidence” should describe coverage, freshness, mapping specificity and review status separately. Do not manufacture P10/P90 quantiles from three hand-selected cases.

Lag and pass-through can later be calibrated from actual invoices and comparable stable specifications, but price history alone cannot identify whether movements came from commodity cost, volume, capacity, hedging or changing terms. Backtest against held-out historical periods with only information published by the prediction date. Evaluate forecast error, interval coverage, reason-code accuracy and the rate at which the model correctly declines to estimate.

## Technical ambition and delivery boundary

The credible ambition is an evidence graph connecting contract versions, BOM revisions, manufacturing routes, normalized commodity observations and supplier prices; a deterministic calculation layer turns that graph into auditable scenarios. AI proposes extraction, material mappings, missing-input questions and alternative hypotheses. Reviewed typed inputs and deterministic math produce the actual amounts.

Start with one process family and one region where pilot customers can provide baseline invoices, BOM masses and supplier breakdowns. Implement immutable source snapshots and both method types, then validate on real parts before claiming pricing accuracy. Later add hierarchical BOM rollup, route-specific rejection/rework, grade premiums, calibrated lag distributions and supplier-specific cost structures. A technical demo can establish correct calculation and transparent limitations; it cannot establish attainable savings without comparable quotations and eventual purchase evidence.

Additional manufacturing reference for a deeper phase: [NIST Manufacturing Cost Guide, AMS 200-9](https://www.nist.gov/publications/manufacturing-cost-guidea-primer-version-10). The publication landing page was checked; its full report was not reviewed in this research pass.
