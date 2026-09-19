# Procus master design contract

19 September 2026 · Implementation-aware synthesis of Salesforce, enterprise component, and procurement research.

**Identity:** Procus is a quiet procurement workbench. Parts, supplier relationships, negotiation progress, spend, and agent work are the primary objects. Blue identifies actions and selection; color earns its place by explaining a state or exception. Preserve the five-page structure, make the information easier to compare, and reveal supporting detail on demand.

This document records the current redesign in `src/styles.css`, `src/views.js`, `src/negotiation.js`, `src/evidence.js`, `src/rfq.js`, `src/data.js`, `src/app.js`, `src/model.js`, and `index.html` under `/Users/maxminkkinen/Desktop/Procus`. It supersedes conflicting dimension proposals in the research notes. It is a design contract and acceptance checklist, not a claim that every check has passed or that the prototype has live backend integrations.

## Evidence and provenance

Read the underlying [Salesforce research](../design-references/salesforce/RESEARCH.md), [enterprise research](../design-references/enterprise/RESEARCH.md), and [procurement research](../design-references/procurement/RESEARCH.md). Source PNGs behind the priority recipes below were opened and visually inspected during synthesis.

- Salesforce components come from official **legacy SLDS1** blueprint documentation at `v1.lightningdesignsystem.com`. They are real rendered component demos. They are **not current SLDS2** component measurements. SLDS2 now has a different documentation site; its contemporary components were not captured here.
- Carbon and Fluent captures are public, live rendered Storybook components. Saved DOM and computed style evidence support their CSS-pixel dimensions.
- Salesforce analytics and Ramp help examples are official embedded product screenshots. Ramp reporting and SAP Ariba examples are embedded product imagery. Their raster geometry can be measured at the saved scale, but native application CSS and font metrics cannot be recovered from those images.
- Zip captures are simplified marketing illustrations. They support behavior and hierarchy ideas, not native app geometry. Coupa was blocked by verification, so no design claims are made about it.
- Vendor logos, icons, screenshots, marketing artwork, and proprietary text remain research material. They are not Procus assets.

## Five-page and shared-component inventory

| Page | Primary question | Current component contract |
|---|---|---|
| Overview | What needs action, and what value is at stake? | Four-cell metric strip led by 49 / 49 products monitored; one evidence-backed price finding; priority parts and negotiation pipeline before the purchasing trend and compact agent activity |
| Parts & suppliers | Which part, supplier, price signal, and negotiation state? | Severity view row; search and filters; supplier grouping; aligned parts table; selected-row state; right-side part detail |
| Workflow | Which negotiations are moving or stalled? | Compact price finding; five stage lanes; case identity, owner/time and impact; stage changes through detail |
| Agents | What is running, and where is human input needed? | Agent roster first; collapsed buyer decisions and supplier conversations alongside; timestamped activity |
| Spend | How do baseline, opportunity, agreed and realised savings relate? | Four-cell metric strip; historical/projected trend; full-width supplier table and totals; category comparison; calculation notes |

Shared primitives: white global header; original Procus mark; five-item navigation; page title and context; one primary action; bordered cards; numeric cells; plain-text status with optional dot; search/filter controls; quiet view tabs; chart legend; detail drawer; negotiation dialog; editable supplier/RFQ subject and body; optional local RFQ preparation; local copy confirmation; empty and selected states.

Assemblies remain part of the product vocabulary and future object hierarchy. The current implemented Products surface is explicitly **Parts & suppliers**; this redesign does not claim that a new assembly management model has been implemented.

## Priority recipes — seven decisions

| ID | Pattern and Procus application | Official source and inspected PNG | Decision |
|---|---|---|---|
| P1 | Dense, aligned tables for parts and spend | [SLDS table](https://v1.lightningdesignsystem.com/components/data-tables/) · [PNG](../design-references/salesforce/data-tables-component.png); [Carbon table](https://react.carbondesignsystem.com/iframe.html?globals=theme:white&id=components-datatable-toolbar--default) · [PNG](../design-references/enterprise/carbon-table-crop.png); [Ramp help](https://support.ramp.com/ramp-procurement-quick-start-guide) · [PNG](../design-references/procurement/ramp-purchase-orders-table.png) | Shared cell insets and column alignment; readable two-line identity; dedicated monetary columns; quiet separators |
| P2 | Compact object/page header | [SLDS header](https://v1.lightningdesignsystem.com/components/page-headers/) · [PNG](../design-references/salesforce/page-headers-component.png) | Title/context left, action right; no promotional banner; one alignment grid |
| P3 | Quiet navigation and original icons | [SLDS navigation](https://v1.lightningdesignsystem.com/components/vertical-navigation/) · [PNG](../design-references/salesforce/vertical-navigation-component.png); [Fluent navigation](https://react.fluentui.dev/iframe.html?id=components-nav--basic&viewMode=story) · [PNG](../design-references/enterprise/fluent-nav-crop.png) | Narrow rail, consistent outline icons, pale selection plus left rule, counts only for useful queues |
| P4 | Underlined views and one toolbar | [Carbon tabs](https://react.carbondesignsystem.com/iframe.html?globals=theme:white&id=components-tabs--default) · [PNG](../design-references/enterprise/carbon-tabs-crop.png); [Ramp help](https://support.ramp.com/ramp-procurement-quick-start-guide) · [PNG](../design-references/procurement/ramp-requests-toolbar-table.png) | Severity controls behave as view filters, not colored badge collections; table follows controls directly |
| P5 | Summary, chart and detail describe the same figures | [Ramp reporting](https://ramp.com/reporting) · [PNG](../design-references/procurement/ramp-budget-dashboard.png) | One metric strip, one main trend, aligned detail; separate potential, agreed, and realised savings |
| P6 | Compact workflow progress | [SLDS path](https://v1.lightningdesignsystem.com/components/path/) · [PNG](../design-references/salesforce/path-component.png) | Small current/completed/pending steps in selected work; retain workflow lanes for overview; no giant path in every row |
| P7 | Contextual evidence and preparation | [Fluent drawer](https://react.fluentui.dev/iframe.html?id=components-drawer--inline&viewMode=story) · [PNG](../design-references/enterprise/fluent-drawer-crop.png) | Part evidence uses a right drawer. Negotiation preparation uses a wider centered dialog with header, scrollable body and footer. This is an intentional Procus adaptation, not a pixel copy of Fluent |

Secondary inspiration: [Zip workflow illustration](../design-references/procurement/zip-workflow-branches.png) for responsibility and steps; [Zip exception illustration](../design-references/procurement/zip-sla-exceptions.png) for anomaly beside subject; [SAP category imagery](../design-references/procurement/sap-category-dashboard.png) for chart scope. These do not override measured component evidence or the current implementation.

## Measured reference versus chosen implementation

All reference numbers below are CSS pixels unless marked raster. Procus numbers are read from the current stylesheet, not inferred from vendor screenshots.

| Element | Observed reference | Current Procus choice |
|---|---|---|
| Base UI | SLDS 13/19.5px; Carbon 14/18px; Fluent 14/20px | 13px body with 1.5 line height (19.5px); system font stack |
| Page title | SLDS bounded object header, 16px panel padding | 26px/1.3, weight 650; 24px title on small screens |
| Table | SLDS 32px header; Carbon 48px header/rows and 16px insets; Fluent 45px rendered row | 40px header, 56px body cell minimum geometry, 10px vertical/16px horizontal padding; content may increase height |
| Table typography | SLDS 13px with 700 header weight; Carbon 14px/600 header | 12px/600 header; 13px body; 11px secondary identity |
| Page/header controls | SLDS 32px button; Fluent 32px/4px radius | Button minimum 34px, 7px × 14px padding, 12px/600 text, 5px radius; content can increase height |
| Sidebar | SLDS 37.5px rows in 320px demo; Fluent 260px rail | 216px rail; 196px at ≤1200px; minimum 42px navigation item, 12px icon gap |
| Icons | Reference systems use coherent families | Original 20×20 viewboxes, rendered 17px, stroke 1.4, no fill, consistent joins; brand mark 28px/stroke 1.8 |
| Tabs/views | Carbon 40px height, 16px horizontal inset, 2px active rule | Filter controls use 12px × 16px padding and 2px underline; natural height follows 13px text, not hard-coded 40px |
| Cards | SLDS header radius 4px; Carbon flat corners | 7px card radius, 1px border, no persistent card shadow; card heading minimum 56px |
| Part detail | Fluent drawer 320px, 24px content inset | Right drawer `min(460px,100vw)`, full height, internal vertical scroll |
| Negotiation | Fluent contextual anatomy, short flow | Centered dialog maximum 760px, viewport minus 40px; header/body 28px horizontal inset; 10px radius |
| Metric strip | Ramp raster alignment, not extractable native metrics | Four joined cells, 20px × 24px padding; label 12px, main value 27px, note 11px; tabular numerals |
| Price evidence | Procus synthesis, no vendor pixel-copy claim | Four columns; 14px × 24px cell padding; 11px labels, 22px/600 values, 10px basis text; two columns on mobile/detail |

Research proposals of 44/48px rows, 224–240px rails, 14px base type, or 480–560px negotiation drawers are **not current implementation values**. Use this table when comparing screenshots to avoid accumulating conflicting scales.

## Current tokens and craft rules

The `--slds-*` prefix is inherited project naming. These are local Procus tokens and do not assert conformance to current SLDS2.

| Role | Current token/value |
|---|---|
| Primary text | `--slds-text-default` → `#203047` |
| Secondary text | `--slds-text-weak` → `#526174` |
| Tertiary text | `--slds-text-weakest` → `#617084` |
| Page / surface | `#f6f8fb` / `#ffffff` |
| Structural border | `#dce3eb`; subtle separator `#e9edf2` |
| Interactive edge | `#8190a4` |
| Action blue / hover | `#1769bd` / `#014486` |
| Link / focus | `#0b5cab` |
| Selection tint | `#eaf2fc` |
| Success | `#2e844a`; dark success text `#194e31` |
| Warning | `#dd7a01`; dark warning text `#5f3e02` |
| Error | `#ba0517`; dark error text `#8e030f` |

Spacing token scale is 4, 8, 12, 16, 24, 32, 48px at the browser's default 16px root size. The current layout additionally uses optical values of 20px card gaps, 28px main top/dialog horizontal inset, 32px page side gutters, and 56px card headers. Keep these role-based values consistent; do not pretend the application already uses an exclusive 8px grid. Desktop main padding is 28px 32px 48px; medium is 24px; mobile is 20px 16px.

Use 8px for closely related label/control spacing, 12–16px for sibling controls, and 20–24px for panel sections. Type is sentence case for readable labels, with small uppercase context labels allowed only at page/navigation scope. No widely tracked uppercase table headers. Keep tabular numerals in every comparable metric. Use 14px/650 card headings, 15px/600 finding headings, and 22px/600 negotiation headings without adding a new scale for each page.

The custom navigation family encodes Overview as dashboard panes, Parts as an assembly cube, Workflow as connected stages, Agents as a signal inside a hexagon, and Spend as an axis/trend. Match optical weight and bounding boxes. Do not add colorful tiles behind every icon. A small symbol well in the single actionable finding is permitted; it signals a specific event.

Badges are reduced to text with an optional 6px semantic dot; quiet states omit the dot. Status color appears once per object where practical. Remove decorative “AI-powered”, “live intelligence”, category ribbons, duplicate “active” pills, large instructional banners, and status repeated in title, card and row. Counts must help prioritize a queue. Keep illustrative explanations in generated preparation factual and unobtrusive. The RFQ branch explicitly identifies local demonstration. Do not reintroduce portfolio-wide sample-data labels removed by the current design steering.

## Table alignment and financial meaning

1. Text identities align left. Monetary values, percentages and quantities align right with their corresponding numeric headers. Use `.p-num` on both header and body cells. Match the 16px inset; avoid flex-centering `td` elements.
2. Keep supplier and part descriptions in their identifying column. Secondary text may wrap; numeric columns remain unbroken. Empty numeric values use a consistent dash. Use semantic table headers and explicit column groups.
3. Supplier **Share of spend = supplier baseline annual spend ÷ total baseline annual spend**. The current implementation uses `row.current / totals.current` for both bar width and percentage text. It must not divide by the largest supplier. Values sum to about 100%, allowing rounding. The mixed bar/percentage column has a left-aligned descriptive header and an internal right-aligned 42px percentage slot; this is a deliberate composite-cell exception.
4. Category **Relative spend** bars intentionally use `entry.current / biggestCategory.current`. That scale ranks magnitudes; it is not a percent share. Never label it “Share of spend”. Amounts and opportunity columns remain separately right aligned.
5. Baseline is current unit price × fixed annual quantity. Potential is the nonnegative current/reference difference × quantity. Agreed savings are a subset of identified potential, never added on top. Projected spend = baseline − agreed; still open = potential − agreed. “No action” removes the case from opportunity totals.
6. Realised savings depend on verified invoices/months in the sample model. A stage change alone must not create realised savings. The prototype uses fictional data and fixed-volume assumptions; historical monthly and projected run-rate series must remain visibly distinct.
7. EUR total amounts use whole-euro formatting; unit prices retain 2 decimal places and up to 3 below €1. Keep the same formatter for comparable columns. Do not confuse price increase exposure with negotiable potential savings.

## Implemented alert → framework → editable draft, with optional RFQ

This is a local demonstration driven by a shared part record and deterministic templates, not a connected AI negotiation service. The Overview subtitle is **Make every product negotiable.** The first metric is **49 / 49 products monitored**. Priority parts and negotiation status precede the purchasing chart. Portfolio spend/opportunity figures derive from the same updated part data; the hero is not an independent promotional calculation.

**Entry.** Overview and Workflow prefer the open price-increase case with explicit negotiation evidence (TM-105), falling back to the highest-priority open increase when necessary. The finding names the part, supplier and parent assembly. “Generate framework” opens preparation; “View part evidence” opens the selected part. The four evidence cells remain visible on the Overview finding and in the framework; Workflow uses only the compact finding header to keep the board in view. The price-change value carries the alert emphasis; no full-width colored marketing banner is used.

**Framework.** Show evidence, current price, proposed opening, potential annual saving, an opening/internal-limit comparison, sources, recommended approach and expandable assumptions. The progress strip is Price drift detected → Framework → Supplier draft (or Alternative sourcing). The buyer owns the supplier relationship. The framework explicitly states that the index explains one cost input, comparability needs validation, and generating a plan creates neither an agreement nor realised savings.

**Supplier draft.** “Draft supplier message” opens an editable subject and body, with recipient context. The current ask requests the opening price, cost breakdown, validity, lead time and conditions. Indicative annual volume is explicitly not a purchase commitment. Subject/body edits remain in the active dialog state when returning to the framework and reopening the draft. There is no durable save, email connection or Send control.

**Copy.** “Copy draft” copies the current subject and body, then announces “Draft copied. Nothing has been sent.” Clipboard failure selects the message body and offers keyboard-copy guidance. Closing the dialog can discard the current preparation session. Do not promise saved drafts or automatic negotiation-stage advancement from generation.

**Optional RFQ.** “Find alternatives” opens RFQ preparation for the same part. “Run RFQ agent demo” performs a local state transition, displaying matching requirements and illustrative results. For TM-105, Baltic Castings AB has a simulated €19.94 quote and Nordic Precision Castings has no quote with qualification pending. Other parts show that no demo alternatives/quotes are available. “Prepare RFQ draft” creates an editable subject/body. The recipient remains an alternative supplier to choose after qualification review. Copying does not contact suppliers, qualify them, switch source, or place an order. Returning to the framework preserves active RFQ draft state.

### Exact shared hero scenario

| Field | Implemented value | Meaning |
|---|---:|---|
| Part / assembly | TM-105 Aluminium housing / Conveyor drive module | One shared record across finding, detail, framework, activity and financial totals |
| Previous unit price | €20.00 | October 2025 baseline |
| Current unit price | €22.40 | September 2026, +12% over the same SKU baseline |
| Annual quantity | 26,000 units | Fixed illustrative volume; current annual spend €582,400 |
| Aluminium index | +3% | Same Oct 2025–Sep 2026 window; material context only |
| Internal comparable | −8% | Versus current €22.40 price; requires equivalent specification/terms |
| Alternative quote | −11%, displayed €19.94 | Indicative and unqualified; €22.40 × 0.89 = €19.936 before displayed rounding |
| Opening ask | −10%, €20.16 | Proposed supplier-facing opening reduction from current price |
| Potential saving at opening | €58,240/year | (€22.40 − €20.16) × 26,000; not achieved savings |
| Internal LAA | −6%, displayed €21.06 | Minimum acceptable reduction; €22.40 × 0.94 = €21.056 before display rounding; private buyer limit |

Price/index percentages describe historical movements; comparison gaps, opening ask and LAA use today's quoted price. Do not add them. A +12% price movement versus a +3% index movement is a **9 percentage-point growth difference**, not proof of a 9% overcharge or recoverable saving. Supplier revenue and the buyer's share of it are unknown. No replacement is confirmed qualified. Qualification, capacity, landed cost, tooling, payment terms and continuity remain buyer checks.

### Internal-information boundary

The framework deliberately shows **Minimum acceptable reduction (LAA) · Internal only**. Supplier messages and RFQs are built by separate allowlisted functions, `supplierDraft(product)` and `rfqDraft(product)`, rather than copying internal framework HTML. Never interpolate the LAA, reserve/walk-away values, internal comparable details, alternative supplier identity or private fallback strategy into supplier-facing drafts or clipboard output.

Supplier drafts may include contact, part ID/name, current price, opening request, indicative volume and quotation conditions. RFQ drafts include part/category/specification, indicative volume, qualification requirements and requested commercial terms; they omit private negotiation evidence and targets. Users can edit their drafts, but system-generated defaults must preserve this boundary. Future backend/AI integration must maintain the same separation.

### Capability and labeling limits

Portfolio-wide sample-data ribbons remain removed. The generated framework calls evidence and buyer targets illustrative within assumptions; the RFQ branch explicitly says it is a local demonstration with no suppliers contacted. No remote AI execution, fresh market lookup, supplier qualification, external communication, durable draft storage or procurement commitment is represented as complete. These are future capabilities, not missing visual states to imply with animation.

## UX principle alignment

[UX-PRINCIPLES.md](UX-PRINCIPLES.md) contains the research and proposed acceptance criteria. Its vendor-guidance citations are kept distinct from the implemented pixel contract here:

- [NN/g progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/): show the actionable part and next step before secondary assumptions. The framework keeps sources/leverage in an expandable section; priority parts precede charts.
- [Microsoft human–AI interaction guidelines](https://www.microsoft.com/en-us/research/blog/guidelines-for-human-ai-interaction-design/): explicit invocation, correction and human control. Framework, supplier draft and optional RFQ are distinct steps; subjects/bodies are editable; nothing sends.
- [Google PAIR explainability and trust](https://pair.withgoogle.com/chapter/explainability-trust/): evidence has separate baselines and limitations; an illustrative quote is not a qualified supplier and an index is not total part cost.
- [Salesforce SLDS principles](https://developer.salesforce.com/docs/platform/salesforce-pages-developers-guide/guide/vf-dev-best-practices-slds-intro.html) and [datatable reference](https://developer.salesforce.com/docs/platform/lightning-component-reference/guide/lightning-datatable.html): clarity, consistent formatting, typed alignment and deliberate hierarchy inform the shared table/shell contract.

Where UX-PRINCIPLES proposes 36px headers and 48/60px row variants, the inspected implementation currently uses **40px headers and 56px body-cell minimum geometry**. This master is authoritative for implemented dimensions. UX-PRINCIPLES also proposes Review later/Dismiss behavior, assumption editing, saved drafts, activity updates and resurfacing rules: these remain future acceptance targets unless separately implemented and verified. Current draft retention is within the open preparation session, not durable saving. Completed checks and remaining limits are recorded in [VALIDATION.md](VALIDATION.md).

## Responsive behavior on all pages

| Width/condition | Shared behavior and page effects |
|---|---|
| >1200px | 216px vertical navigation; 32px horizontal main gutters; Overview priority parts/pipeline and trend/agent activity paired; other two-column panels supported |
| ≤1200px | 196px rail; 24px main padding; Overview and ordinary two-column grids stack; pipeline becomes four columns; ordinary finding layout can wrap; evidence-finding action wraps at ≤1000px |
| ≤1000px | Metric strip becomes two columns; page metadata can wrap; header controls remain within their content area |
| ≤760px | Horizontal scrollable navigation below 56px global header; 16px main side gutters; page heading/action stack; all ordinary content stacks |
| Parts & suppliers | Wide table remains inside a keyboard-focusable horizontal scroll wrapper (860px minimum table width); search/filter controls wrap; detail drawer fills up to viewport width |
| Workflow | Five lanes use at least 205px per lane with board-local horizontal scroll on wider screens; mobile lanes stack into one column, individual card lists cap at 440px height |
| Agents | Desktop roster occupies the left column; collapsed decisions and conversations share the right. Cards stack below 1200px; long supplier names and action labels wrap |
| Spend | Supplier table scrolls within its wrapper; on mobile category bars disappear while category, annual spend and opportunity remain in aligned columns; chart has a 540px minimum width with chart-local horizontal scroll |
| Preparation and evidence | Desktop dialog maximum 760px; mobile width `100vw - 20px` and height at most `100dvh - 20px`; body scrolls; footer actions wrap; header/body padding becomes 20px. Evidence becomes two columns at ≤760px, and is always two columns inside part detail |
| Coarse pointer / reduced motion | Interactive targets minimum 44px; search and message input use 16px text; transitions disabled for reduced-motion preference |

Horizontal scrolling is intentional only inside navigation, tables, workflow board and narrow chart containers. The page itself must not overflow horizontally. Do not compress charts or financial columns into illegibility to avoid a local scroll region.

## Acceptance checklist

These remain reusable acceptance requirements. See [VALIDATION.md](VALIDATION.md) for the checks performed during this implementation.

- [ ] Inspect all five pages at 1440px, around 1024px, and 390–430px; no page-wide overflow, clipped actions, overlapping labels or hidden primary content.
- [ ] Verify headers, cell text and monetary right edges align; long supplier/part strings and empty values preserve the column grid.
- [ ] Verify supplier shares use total baseline denominator and approximately sum to 100%; category relative bars use their separately labeled maximum scale.
- [ ] Confirm Overview, Workflow, Spend and detail figures update coherently when a sample negotiation changes stage; potential/agreed/realised remain distinct.
- [ ] Test search, severity/status filtering, grouping, row details, stage changes, agent pause/resume and conversation expansion through their actual controls.
- [ ] Complete finding → framework → supplier draft → edit subject/body → back → draft → copy; clipboard reflects both edits. Complete Find alternatives → Run RFQ agent demo → Prepare RFQ draft → edit/copy; no supplier contact occurs.
- [ ] Inspect generated supplier and RFQ subject/body/clipboard text for private LAA, limits, alternatives and strategy; verify allowlisted generation stays separate from internal evidence. Check €20→€22.40, opening €20.16, LAA €21.06, alternative €19.94 and annual opportunity €58,240 across the shared hero surfaces.
- [ ] Test dialog close, Escape, focus containment/restoration, backdrop behavior, inert background and body scroll lock; verify visible focus and accessible dialog titles.
- [ ] Verify keyboard access to scrollable tables, labels on icon actions, selected/pressed states, meaningful chart descriptions and local copy feedback.
- [ ] Check contrast for normal/hover/selected/disabled text, controls and status colors; do not rely on hue alone. Confirm coarse-pointer targets and reduced motion.
- [ ] Compare rendered Procus components with the mapped source crops at native pixel scale. Match alignment and craft while preserving original content, icons and palette.
- [ ] No marketing imagery or vendor branding ships; no fake live backend, AI generation, supplier response, save persistence or external send capability is implied.

## Rejected visual patterns

Large welcome/AI banners; repeating colored capsules; navigation icon tiles; rainbow KPI cards; glowing scan overlays; gratuitous animation; confetti; broad card shadows; floating chart fragments; vendor logos as decoration; too many chart colors; ambiguous “savings” totals; full workflow paths on every row; tiny raster-inspired type; copied Salesforce orange object icons; marketing-scale whitespace; dense tables squeezed past legibility. Additional visual treatment must improve an operational decision to justify its space.
