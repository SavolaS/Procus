# Procurement references for Procus

Captured and visually inspected 19 September 2026. Identity rule: **Procus is a calm procurement workbench where parts, supplier negotiations, and agent work are the objects; decoration must earn its space by explaining one of those objects.**

## Evidence quality and method

Independent headless Google Chrome, Playwright, 1440 × 1000 viewport at device scale 1. Full pages were scrolled before capture. App images exposed by those pages were then rendered in the browser at 1400 px width and captured as PNG, with tight crops made from those actual screenshots. Every full-page overview, component capture (via contact sheets), and selected crop was viewed. No logins, vendor contact, form submissions, or verification bypasses.

**No source below was a live authenticated application.** Ramp help images are actual product screenshots embedded in official documentation; Ramp's reporting visuals and SAP's category dashboard are embedded product imagery; Zip's assets are simplified marketing component illustrations. Do not claim extracted application CSS or measured native app fonts. Pixel geometry is exact only for the saved screenshot scale; font sizes and usable UI dimensions below are proposed Procus values.

Source manifests `*-images.json` preserve source image URL, alt text, natural resolution and element bounding rectangle. `*-capture-manifest.json` maps browser captures to URLs. `*-dom.html` captures page DOM; it contains **marketing/help HTML**, not the app represented by the images. All PNGs remain reference-only; do not ship reference logos or proprietary app imagery.

## Sources and verdicts

| Source | Files | Verdict |
|---|---|---|
| [Ramp procurement quick start](https://support.ramp.com/ramp-procurement-quick-start-guide) | `ramp-requests-full.png`, `ramp-requests-component-1.png`, `ramp-requests-component-2.png` | **P1**: strongest credible real-app evidence for table alignment, object names, quiet status, and a single toolbar. |
| [Ramp reporting](https://ramp.com/reporting) | `ramp-full.png`, `ramp-component-3.png`, `ramp-budget-dashboard.png` | **P1/P2**: connected summary/chart/detail geometry; dense controls, limited chart palette. Some other illustrations are conceptual. |
| [Zip spend insights](https://zip.com/capabilities/spend-insights) | `zip-spend-full.png`, `zip-spend-component-1.png` through `-4.png` | **P2**: good semantic patterns for exceptions, savings and reporting; simplified illustrations, not full dashboards. |
| [Zip workflow engine](https://zip.com/capabilities/workflow-engine) | `zip-workflow-full.png`, `zip-workflow-component-1.png`, `zip-workflow-component-3.png` | **P2**: comprehensible parallel approvals, actor/time/action notification. Marketing shadows and scale must be rejected. |
| [Zip enterprise](https://zip.com/solutions/enterprise) | `zip-full.png`, `zip-component-2.png` through `-5.png` | **P2**: scan → findings → detail; useful behavior, overdecorated visual treatment for Procus. |
| [SAP Ariba category management](https://www.sap.com/products/spend-management/category-management-software.html) | `sap-full.png`, `sap-category-dashboard.png` | **P2**: real product-image structure: category title, aligned chart cards, units and timeframe. Marketing page styles partly failed to load; embedded image itself rendered. A direct isolated asset load timed out, so final crop comes from the full-page screenshot. |
| [Coupa spend analysis](https://www.coupa.com/products/spend-analysis/) | `coupa-full.png` | **Blocked** by Cloudflare verification. No design claims inferred. |

## Tier 1 — reinterpret now

### 1. An object table with a stable cell contract

**Source crop:** `ramp-purchase-orders-table.png` (1195 × 616), from Ramp's 1535 × 917 original screenshot rendered at 1400 px wide.

Observed: one regular row grid; object name and supplier on two lines; text columns left aligned; total amount and billing totals right aligned; payment progress fits inside one numeric cell. Status labels are small rectangular neutral/semantic fills, not loud capsules. Table and filters share the same width. In the 1400 px rendering, sidebar ends at x≈202, table header spans y≈212–243, rows repeat at ≈59 px. These are screenshot coordinates, **not native CSS tokens**. Most frequent flat pixels: `#ffffff`, `#f4f2f0`, `#e9e5e2`, `#fcfbfa` (sampled exactly, some values affected by image resampling).

**Procus mapping:** assemblies/parts, suppliers, negotiations and spend tables. Use a single shared table component with 48 px one-line rows / 60 px two-line rows, 36 px header, 16 px horizontal padding, a 32 px icon well, right-aligned decimal/tabular numerals, matching header and cell alignment, fixed status cell width. A part's name sits over its identifier; supplier remains a separate column. Keep selection/expansion affordances in dedicated narrow columns so labels never shift. Align sort chevrons beside the header label without changing numeric alignment.

**Do not inherit:** Ramp's nearly illegible tiny type at screenshot scale, external vendor logos, or many sidebar counts. Effort M.

### 2. One toolbar, one view row, one primary action

**Source crop:** `ramp-requests-toolbar-table.png` (1197 × 237).

Observed: understated horizontal view tabs, one short underline on the active view, directly followed by search/filter controls and then the table. Request state is represented once in the table; views expose counts when useful. There is no giant intro banner or duplicate KPI strip above the list.

**Procus mapping:** negotiation list and spend. Page header carries title and one primary action. Compact view tabs below, then one 40 px control line. Keep a maximum of three always-visible filters and put the rest under Filters. Remove decorative chips such as “AI-powered”, “live intelligence”, and repeated “active” labels that do not change what the user does. Reserve counts for actionable queues. Effort S/M.

### 3. Summary → visual → detail shares one numeric story

**Source crop:** `ramp-budget-dashboard.png` (1226 × 787).

Observed: totals, utilization, monthly actual/budget bars and detailed rows live in one framed surface. Neutral budget bars sit behind muted actuals; actual and committed amounts remain distinct. Detail rows use the same labels as the summary. Orange appears only on overage.

**Procus mapping:** spend page with exactly three relevant numbers (spend in selected period, change versus comparison period, addressable negotiation opportunity), one broad trend plot, then its part/supplier table. Clicking a trend point or supplier filters the details. Preserve currency/unit/timeframe adjacent to the amount. Avoid scattershot KPI cards and charts that answer the same question twice. Effort M.

## Tier 2 — behavior and composition

### 4. Workflow branches explain responsibility

`zip-workflow-branches.png` shows one incoming stage, three parallel reviews, one merged outgoing stage. Thin connectors, spare text and a single selected node convey the graph. This is a raster illustration, not an inspected workflow editor.

For Procus, show **Detect → Analyze → Framework ready → Draft ready**, with optional approval only when required by the action. Running agent activity should be a compact queue with part/supplier, current step, elapsed time and one status dot. Use a canvas only for editing a workflow; use a table or timeline for monitoring runs. Reject shadows and sprawling diagrams on Overview.

### 5. Exceptions place the anomaly beside its subject

`zip-sla-exceptions.png` shows each approval name left and its delay right, with red restricted to delay values. It is a marketing illustration; its enormous typography is not an app specification.

For Procus, “Bearing 6204 · Northline Components” left, “+18.4%” aligned right, and a second line “€0.42/unit increase · €24,600 annual exposure”. The entire row opens the evidence. A small amber icon and the anomalous number are enough; no full-width red alert banner.

### 6. Notification contains actor, timestamp, event and next action

Use `zip-workflow-component-3.png` as the complete source. `zip-notification.png` is a tighter crop but includes partial integration decorations at its lower edge, so use the full source for comparison. Marketing imagery includes Slack/Teams logos; these are irrelevant to the Procus implementation.

For Procus, one contextual agent notification sits under the overview header or in a “Needs attention” panel. Actor becomes “Cost monitor”; timestamp says “2 min ago”; event names the part and price change. A single **Generate framework** button opens the negotiation work surface, preserving the evidence and part context.

### 7. Category analytics keeps scope beside charts

`sap-category-dashboard.png` has a persistent category title, cards aligned at the same y coordinate, each chart title over a short scope line, and legends below. Exact crop is 775 × 471. Cards in this raster are about 216 px wide with 12 px gutters; the fourth card is cut off by the original hero artwork. Do not replicate the clipped layout. The proposed Procus grid is responsive: 2 columns ≥1100 px, 1 column below; chart minimum width 320 px. Prefer bar comparison to a donut when ranking suppliers. Keep at most 5 categories and aggregate the rest. Do not reproduce SAP's rainbow palette.

## Original Procus demo: price flag → framework → supplier draft

This is a **proposed Procus state machine**, inspired by observed evidence/action patterns, not a claim that any captured reference has this exact feature.

1. **Flagged.** A single alert row: “Bearing 6204 increased 18.4%” with supplier, old/new unit price, effective date, 12-month volume and annual exposure. Button: **Generate framework**. Secondary text link: View price history.
2. **Analyzing.** Open a right-side detail panel (480–560 px desktop) or full-width work page. Keep the source alert visible in the heading. Show 3 concrete progress rows: comparing purchase history; checking alternative suppliers; preparing negotiation position. Disable only the initiating button and expose a cancel action. Do not invent an actual external data lookup in the demo.
3. **Framework ready.** Replace progress with four concise sections: target price and acceptable range; supporting evidence with source labels; negotiation levers (volume, lead time, term); recommended opening ask. Show “Demo data” once beside the panel title. Primary action: **Draft supplier message**. Secondary: Adjust assumptions.
4. **Draft ready.** Editable subject and body, supplier contact as text, attachments/evidence links below. Buttons: **Save draft**, Copy. A real Send action is unnecessary for this demo. The user reviews the actual message before any future sending action.
5. **Saved.** The alert becomes “Framework ready” or “Draft prepared” in the existing queue; add one timestamped activity entry and link to its negotiation record. No celebratory confetti or success hero.

Example demo numbers must remain internally consistent: old price €2.28 → new €2.70 is +18.42%; volume 58,571 units gives approximately €24,600 incremental annual exposure. Round headline to +18.4%, exposure to €24.6k. Keep raw values visible in details and label all demo calculations as such.

## Proposed alignment and type contract

These are Procus implementation recommendations, not extracted vendor values:

- Base UI 14/20 px; secondary 12/16; page title 24/32 at weight 600; section title 16/24 at 600; key amount 24/28 at 600 with tabular numerals.
- Space scale 4, 8, 12, 16, 24, 32. Page horizontal padding 24; panel 20 or 24; panel gap 16. Do not use every value interchangeably within one surface.
- Cards: 1 px quiet border, 6–8 px radius, no persistent heavy shadow. Shadows only communicate overlay/elevation.
- Buttons 32 px compact / 36 px default, icons 16 px, uniform optical alignment. One action blue, neutrals for everything else.
- Agent states: gray queued, blue running, green completed, amber needs review, red failed. Shape/text accompanies color. Use status color once per row.
- Tables: no per-cell flex centering; numeric header and data both right aligned; metric/currency unit formatting centralized; sticky header for long lists; horizontal scrolling only when content cannot fit responsibly.

## Graveyard

- Zip's glowing green AI scan overlay: reproduces the distraction problem; keep evidence and severity, remove glow.
- Large drop shadows and floating chart fragments: marketing depth, unsuitable for an operational workbench.
- Brand mascots, partner logos and colorful vendor illustrations in every row: unrelated identity and visual noise.
- Counts on every navigation item: Reserve counts for review queues that justify attention.
- Multiple KPI bands over a list: users must reach the part or negotiation list immediately.
- Empty marketing full-page whitespace: full screenshots prove provenance; they are not layout recommendations.

## Files to compare first

1. `ramp-purchase-orders-table.png` — cell geometry and numeric alignment.
2. `ramp-requests-toolbar-table.png` — tabs/filter/table hierarchy.
3. `ramp-budget-dashboard.png` — analytics tied to detailed objects.
4. `zip-workflow-branches.png` — parallel review semantics.
5. `zip-sla-exceptions.png` — exception emphasis.
6. `sap-category-dashboard.png` — coherent category chart framing.

Full captures and contact sheets are retained for context; source manifests resolve each crop to its public page and original raster. None of the reference PNGs should become application assets.
