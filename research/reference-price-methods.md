# Reference prices: evidence, comparability and research programme

Research date: 19 September 2026. Status: implementation proposal, not a claim that Procus already has these capabilities. Sources below are public primary sources inspected through web search and page retrieval. No paid dataset, private customer data, API credentials or live price feed was accessed.

## Recommendation

Build a reference-price engine that answers three distinct questions:

1. **What does the existing contract permit?** Evaluate its actual price-adjustment formula, observation window, lag, currency, caps and effective date.
2. **What comparable price can this buyer obtain or has this buyer paid?** Normalize offers and transactions against a specified purchasing scenario; distinguish an executable offer from history and a catalogue observation.
3. **What cost movement does the BOM support?** Estimate a range of material and other cost changes from explicitly sourced quantities, cost shares, indices and assumptions.

Show agreement or disagreement among these answers. Do not average them into an unexplained “fair price.” They measure different things: a contractual entitlement, an observed commercial alternative, and a cost hypothesis. Their disagreement is often the most valuable reason to request a fresh quotation or a cost breakdown.

This is a proposed Procus architecture. The source evidence supports its individual ingredients, not a claim that this combination is unique or already validated.

## Findings from primary sources

| Evidence | What the source establishes | Consequence for Procus |
| --- | --- | --- |
| [FAR 15.404-1, official US procurement methodology](https://www.acquisition.gov/far/15.404-1) | Price comparison and analysis of individual cost elements are different methods. Competitive prices and historical paid prices are preferred comparison methods; historical comparisons can be invalid when time, terms or their original basis differ. Quantity, economic conditions and material product differences require adjustments. | Use this as a methodological reference, not as a legal requirement for Finnish private procurement. Record why each observation is comparable and every adjustment. Cost estimates can supplement observed prices without replacing them. |
| [Fairmarkit historical benchmark documentation](https://docs.fairmarkit.com/content/buyers/rfq/benchmark-historical.htm) | Historical matching searches awarded events and uploaded purchase-order lines using identifiers and descriptions. Ambiguous multiple matches do not produce a suggested value; suggested values expose a source. | Historical matching is an existing capability, so the technical ambition must extend to reliable evidence qualification and measured decision improvement. Ambiguity should trigger review rather than an arbitrary lowest price. |
| [ICC Incoterms 2020](https://iccwbo.org/business-solutions/incoterms-rules/incoterms-2020/) | Trade terms allocate costs, risk and obligations between buyer and seller. | Compare at a declared delivery destination and retain named place and Incoterms version. Different terms require sourced cost adjustments; an Incoterm alone does not supply freight amounts. |
| [Nexar supply query templates](https://support.nexar.com/support/solutions/articles/101000472564) | Public GraphQL examples expose manufacturer part matching, sellers, authorized-distributor filters, stock, MOQ and quantity-price levels. The examples also expose a median price at quantity 1,000. | A feasible commercial API integration for electronic catalogue parts. Match exact manufacturer and part; select the buyer's order quantity. Never silently use the quantity-1,000 median for an order of 40. Distributor authorization is separate from the customer's part/site approval. |
| [Nexar region and currency guidance](https://support.nexar.com/support/solutions/articles/101000452637/) | Country and currency affect returned offers but are not hard country filters. Converted prices are estimates, and the documentation recommends notifying users of conversion. | Retain source currency, conversion rate and timestamp. Independently confirm geographic eligibility; requesting Finland does not establish deliverability to Finland. |
| [DigiKey API FAQ](https://developer.digikey.com/faq/products-plans-and-apis) | Keyword search pricing and quantity can be cached for up to 24 hours; ProductDetails is recommended for current pricing and availability. Responses expose API rate-limit headers. | Search to identify parts, then refresh details before a purchasing comparison. Timestamp each observation; handle quotas and failed refreshes explicitly. |
| [DigiKey API products](https://developer.digikey.com/products) | A separate Quote API prices a product list and locks prices for a specified period; Product Information searches the catalogue. | Product lookup and a time-bound quotation are distinct evidence types. Production use needs provider authentication, account eligibility and commercial terms checked before integration. No outbound quote request is part of this research. |
| [aPriori manufacturing simulation](https://www.apriori.com/simulation/) | The vendor describes models covering processes, materials, labour, tooling, regional inputs, yield and scrap. | A raw-material index alone is materially narrower than manufacturing should-cost. Initially describe Procus's output as a BOM cost-pressure scenario. Full process costing is a separate build-or-integrate decision. |
| [Xu and Xie, ICML 2023](https://proceedings.mlr.press/v202/xu23r.html) | Sequential predictive conformal inference addresses time-series dependence that violates ordinary exchangeability assumptions. | A research candidate for uncertainty calibration once a sufficiently large ordered dataset exists. Do not promise distribution-free coverage for arbitrary sparse procurement data using ordinary random-split conformal intervals. |

Provider capabilities are based on their documentation, not an independent accuracy or coverage audit. API access, storage, redistribution, customer-facing display and derived-data rights need commercial confirmation; a public page is not evidence of those rights. The research did not determine production licensing prices.

## Define the comparison before computing a number

The proposed comparison scenario is `(part, revision, specification, approved site, order quantity, annual volume, delivery schedule, destination, currency, decision date)`. An annual-volume commitment and an individual order quantity must be separate fields: a cheap 10,000-piece tier may require one release, not 10,000 pieces spread over a year.

Each candidate observation should retain:

- Original price, currency, unit, price denominator and pack quantity; quantity tiers, minimum order and order multiple.
- Buyer item, manufacturer, manufacturer part number, supplier item, revision, technical equivalence status and approval evidence.
- Seller, manufacturer and underlying source identity; independent-source group to identify duplicate listings of the same offer.
- Incoterm, version and named place; delivery destination, freight, insurance, duties, handling and included/excluded charges when evidenced.
- Tooling, setup and qualification costs; rebate conditions, payment terms, allocation basis and committed volume.
- Quote creation, validity and effective dates; stock observation time, capacity confirmation, lead time and requested delivery date.
- Document or URL, source location, capture time, original value, extraction method, reviewer and status.
- Evidence kind: signed contract, executable quote, historical invoice, historical PO, distributor observation, inferred similar-part estimate or cost scenario.

Keep the original observation immutable; a normalized result is a versioned derivation with reasons. An LLM may extract or propose a material/part match, but deterministic calculations and reviewed matching rules decide whether it enters a comparison. A high extraction score cannot compensate for missing commercial validity.

### Admission gates and result states

Use `eligible`, `conditional`, `excluded` and `missing_evidence` with machine-readable reasons. Suggested critical gates:

1. Exact identity or explicitly approved technical equivalence; unresolved revision or packaging mismatch blocks direct comparison.
2. Price convertible to the same physical unit with a documented conversion; do not infer kilograms per piece without a verified mass.
3. Applicable quantity tier and feasible order multiple; no extrapolating the cheapest bulk tier.
4. Validity covers the decision and commitment scenario; an expired quote may enter history but cannot be called currently executable.
5. Part/site approval and supply timing checked separately; catalogue stock is an observation, not a capacity reservation.
6. Delivery and one-time costs are either compatible, known, or explicitly unresolved. Unknown freight remains unknown.

A blocked direct comparison can still be useful supporting evidence. For example, the system can say “catalogue unit price is lower; delivery cost and approval unresolved,” while withholding net savings and an actionable switching recommendation.

## Calculation design

For a confirmed usable order quantity `Q`, first normalize the offer's price unit and quantity tier. Then construct a cost bridge in the comparison currency:

```text
comparison unit cost = normalized goods price
                     + buyer-paid recurring logistics and nonrecoverable charges / Q
                     + allocated one-time costs / explicitly chosen allocation volume
                     - earned, attributable rebates / applicable volume
```

This is a proposed comparison policy, not a universal accounting rule. Every component has a source and must be included once. Display unresolved components; do not substitute zero. Recoverability and accounting treatment are customer inputs. Payment-term adjustments belong in an optional, explicitly parameterized financing scenario, rather than a hidden discount rate. FX comparisons should distinguish an as-of-date spot normalization from the customer's contractual or hedged conversion.

For a **material-cost change scenario**, use physical BOM consumption when supported:

```text
material cost change per good unit =
    sum(net material quantity / yield × change in input purchase price)
    - change in recoverable scrap credit
```

Yield applies only when quantity is defined as net consumption; if the BOM already provides gross purchased input, dividing by yield again is incorrect. Recovered scrap and unrecovered process waste must be separate. Purchased subassemblies and their exploded children cannot both be costed. BOM scope, effectivity and manufacturing route must align with the priced part revision.

If only indices and baseline **cost shares** are known, use a different scenario:

```text
scenario price(t) = baseline price × [fixed share
                    + sum(cost share(k) × index(k,t-lag) / index(k,base))]
```

The nonnegative shares sum to one. This formula holds the unmodelled baseline portion constant and assumes full pass-through on the modelled share. It is a scenario, not an estimated supplier margin or a market-clearing price. Unknown shares produce sensitivity ranges, not invented precision. Weight fractions in the BOM are not purchase-price cost shares. Empirically fitted lag and pass-through are later research; contractual lag and coefficients must instead follow the actual agreement.

### Triangulate without hiding disagreement

Return separate evidence objects, each with price/range, comparison basis, blockers and provenance:

- `contract_adjustment`: deterministic contractual result if enough verified inputs exist.
- `comparable_offers`: eligible offers individually, including executable quantity and time bounds; any summary displays observation count and independent sellers.
- `historical_anchor`: exact comparable transactions, their dispersion and documented temporal adjustments.
- `bom_cost_scenario`: low/base/high assumptions, covered cost share and unmodelled components.
- `decision`: recommendation such as review increase, request missing terms, obtain fresh quote, or insufficient evidence.

Two observations from the same distributor through different aggregators are one underlying offer. Agreement among correlated sources must not increase confidence as though sources were independent. Sparse data supports a descriptive range only; “90% prediction interval” requires an actually fitted and validated predictive method.

A useful first demonstration is deliberately mixed: an exact current alternative, an expired cheap quote, a pack-size mismatch and a BOM signal pointing downward. The correct outcome retains the first, labels the historical offer, blocks the mismatch, and presents cost pressure separately. Removing all eligible price observations must result in “no comparable reference price,” while still allowing a documented cost scenario.

## Technical ambition that can be tested

| Stage | Research question and implementation | Acceptance evidence |
| --- | --- | --- |
| 1. Evidence and deterministic foundation | Can a versioned part/BOM/offer/index graph compute reproducible comparisons and reject incompatible evidence? Start with one category and customer-reviewed mappings. | Replayable calculations; unit and currency invariants; explicit missingness; fixtures for stale data, wrong revisions, tiers, double-counted BOM children and duplicate offers. |
| 2. Learned comparability | Can constrained entity resolution suggest technical matches while calibrated abstention prevents false equivalence? Combine identifiers, specification extraction and engineering review; store accepted and rejected mappings. | Precision/recall on adjudicated matches; false-acceptance rate and coverage; held-out product families and new suppliers; review time per accepted match. |
| 3. Sparse-data cost transfer | Do BOM attributes and category-specific cost drivers improve forward price-change prediction beyond last price and one broad index? Evaluate hierarchical category models with bounded shares, lag candidates and supplier effects. | Forward-in-time holdouts, independent supplier and part-family holdouts, ablations of BOM and each index; no claim of causality from correlation. |
| 4. Calibrated uncertainty | Can intervals retain useful coverage when materials, volumes and market regimes change? Evaluate rolling calibration and drift alarms; abstain on unsupported categories. | Coverage and interval width by category, data sparsity and forecast horizon; performance under withheld shocks; calibration failures remain visible. |
| 5. Choosing the next evidence | Can the system identify whether one fresh quote, a missing mass, or freight confirmation would most change a decision? Rank evidence requests by expected decision value and acquisition effort. | Fewer clarification rounds and lower active buyer time; usable offers before deadline; prospective decision quality versus fixed checklists. No automatic supplier contact implied. |

The harder scientific problem is not generating a plausible number. It is determining which evidence transfers to a different part, supplier, quantity and date, then quantifying how much uncertainty remains. A defendable R&D claim would be a demonstrated improvement on that task against simple baselines. A knowledge graph, LLM, forecasting model or API integration alone does not establish novelty.

## Validation protocol and proposed metrics

Create an adjudicated dataset of procurement decisions with snapshots of information actually available at each decision date. Retain rejected and unresolved cases. Save index publication/revision timestamps to prevent future information leaking into historical predictions. Separate extraction, comparability, modelling and business-outcome evaluations.

| Layer | Metric | Proposed initial criterion |
| --- | --- | --- |
| Provenance | Results reproducible from immutable evidence and formula version | Every displayed numeric result has traceable inputs; no fabricated source or silent zero. |
| Comparability | Critical false acceptance, blocked-case coverage, review workload | Zero known unresolved identity/unit/revision errors in accepted pilot outputs; report denominators and statistical uncertainty rather than claiming zero population risk. |
| Arithmetic | Recalculation, unit invariance, no double counting | Deterministic edge-case fixtures pass; totals reconcile to eligible rows. |
| Predictive quality | Median absolute percentage error, currency MAE, spend-weighted error, direction accuracy | Compare with last paid price, category median and single-index baselines on the same forward holdout. Set improvement thresholds before fitting; do not choose a favourable metric afterwards. |
| Uncertainty | Empirical coverage plus interval width; abstention rate | If targeting 90% intervals, report measured coverage and uncertainty by slice. A wide interval covering everything is not sufficient. |
| Decisions | Buyer-confirmed actionable opportunities, false alerts, qualified offers on time | Measure precision of recommended actions and proportion of all eligible cases served; failed and abstained cases remain in denominators. |
| Operational value | Active buyer minutes, correction minutes, elapsed time and provider cost | Compare the entire workflow with the existing process, including mapping and onboarding work. |
| Savings | Agreed versus realized impact from matched purchases, net attributable costs | Forecast opportunity is separate from agreement and invoice evidence. Avoided increases stay separate from reductions against the prior actual price. |

Do not evaluate a recommended negotiation target only against the subsequently negotiated price: the recommendation itself may influence that outcome. Keep predictive validation separate from intervention evaluation. A matched or randomized workflow trial can test decision value once the evidence and calculations are reliable; avoid selecting only successfully renegotiated cases.

## Immediate build boundary

Implement the comparison scenario, immutable evidence records, eligibility reasons, deterministic normalization, separate BOM signal and explicit abstention first. Connect an electronic-parts API only if that category is selected and customer data can support reliable identity matching. For engineered parts, prioritize the customer's own quotes, contracts and BOM over unqualified web catalogue matches. Treat learned fair-price prediction and supplier-specific pass-through as research deliverables awaiting suitable data and baseline tests.
