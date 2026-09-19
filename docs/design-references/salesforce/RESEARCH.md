# Salesforce reference research for Procus

Captured 2026-09-19 with isolated headless Chrome at 1440 × 1200, device scale 1. All component PNGs were opened and visually checked. Reference assets are for comparison; do not ship Salesforce logos, symbols, content, or screenshots in Procus.

**Identity filter:** An original, quiet enterprise procurement console with blue accents, restrained status, and strong numerical alignment. Salesforce supplies density and hierarchy lessons; Procus retains its own navigation, iconography, content, and workflows.

## Evidence index

| ID | Official source | Capture | Procus target |
|---|---|---|---|
| SF-01 | [SLDS Data Tables](https://v1.lightningdesignsystem.com/components/data-tables/) | `data-tables-component.png`, `data-tables-page.png` | Spend, parts, suppliers, negotiation lists |
| SF-02 | [SLDS Page Headers](https://v1.lightningdesignsystem.com/components/page-headers/) | `page-headers-component.png`, `page-headers-page.png` | Page title, object context, actions |
| SF-03 | [SLDS Path](https://v1.lightningdesignsystem.com/components/path/) | `path-component.png`, `path-page.png` | Negotiation progress and agent workflow |
| SF-04 | [SLDS Vertical Navigation](https://v1.lightningdesignsystem.com/components/vertical-navigation/) | `vertical-navigation-component.png`, `vertical-navigation-page.png` | Application sidebar |
| SF-05 | [Salesforce Trailhead CRM Analytics dashboard](https://trailhead.salesforce.com/content/learn/modules/wave_exploration_dashboard_navigation/wave_work_the_dashboard) | `analytics-dashboard-component.png`, `opportunity-dashboard-component.png`, `analytics-sorted-table-component.png`, `analytics-page.png` | KPI strip, filters, trend chart, data table |

SF-01–04 each include `*-snippet.html`, `*-styles.css` (actual extracted source rules), and `*-computed.json` (rendered geometry and styles). SF-05 captures embedded official product screenshots, not live dashboard DOM; measurements there are screenshot geometry, not original application CSS.

## SF-01: table craft

The viewed compact table has a light gray header, white rows, subtle horizontal rules, bold sentence-case column labels, and blue record links. Header and row actions occupy dedicated columns. The demo is only 729 px wide, causing excessive truncation; Procus must not replicate that weakness.

**Measured:** 13 px system font; 19.5 px line height; 32 px header; header label weight 700; header fill `#f3f3f3`; header text `#444444`; body text `#181818`; white surface. Header links have 4 px vertical and 8 px horizontal padding.

**Procus recipe (P1):** choose explicit widths for identifier/name, supplier, status, currency, percentage, and action columns. Use 44 px body rows, 36 px header, and 12–16 px cell padding. Set currency, quantities, percentages, and their headers to `text-align:right`, with `font-variant-numeric:tabular-nums`. Let names wrap to two lines when useful. Use a neutral label plus tiny semantic dot for status. Reserve the final 40 px for row actions. Avoid vertically centered pill collections that move numeric baselines.

## SF-02: page header hierarchy

The screenshot pairs small object context and a bold title at left, with a compact action group aligned right. A secondary line communicates count and update time. It is a bounded panel, not a promotional banner.

**Measured:** 729 × 104.5 px panel, 16 px interior padding, 4 px radius, `#f3f3f3` background, 1 px `#c9c9c9` border. Buttons are 32 px tall with 16 px horizontal padding. Link/action blue is `#0176d3`.

**Procus recipe (P1):** quiet breadcrumb/context, 24 px page title, one brief count or description, one primary action. Keep title and controls in one alignment system. Use a white header and modest lower border; allow 24 px page gutters. Remove large explanatory banners, category badges, decorative sparkles, and repeated introductory copy. Salesforce's many icon tools are useful only when each has a real function; Procus should show fewer.

## SF-03: workflow and negotiation status

The 32 px high path encodes completion, active stage, and remaining stage in one horizontal structure. A single next action sits alongside it. The captured states use green completed stages, dark blue current stage, and pale gray pending stage.

**Measured:** 729 × 32 px overall; 13 px labels; 32 px primary button; button fill `#0176d3`; 16 px horizontal button padding. Stage labels are inside the track instead of detached badges.

**Procus recipe (P1):** compact steps: Detected → Prepared → Drafted → Approved → Sent. Use completed checkmarks, a blue current step, and neutral future stages. A row/list status can remain plain text. Do not render the entire path in every table row; reserve it for the selected negotiation or workflow detail.

## SF-04: sidebar

The screenshot uses grouped text navigation and no decorative cards. Selection is a pale blue horizontal fill, a thin left blue rule, and stronger text weight. This retains scanability across many items.

**Measured:** demo width 320 px; row height 37.5 px; text 13 px/19.5 px; row padding 8 px top/bottom, 32 px left, 24 px right; selected text weight 700, other rows 400. Section title is 16 px/700 with 8/16/8/24 px padding.

**Procus recipe (P1):** sidebar width 216–232 px; 38–40 px rows; original 18 px outline icons on the same stroke grid; 10 px icon/text gap. Small muted section labels, one selected item. Prefer a restrained blue left accent and tinted fill over rounded raised pills. Avoid icon background tiles and per-item badges except a genuinely actionable count.

## SF-05: KPI, trend, and detail

The official dashboard demonstrates three distinct jobs: KPIs summarize position, a filter band defines scope, and charts explain change. Its details table right-aligns amounts, unlike the compact blueprint's left-aligned demonstration. Salesforce's tutorial screenshot contains an older analytics style; it is a hierarchy reference, not a palette target.

**Pixel observations:** an approximately 128 px KPI rail in the 800 px dashboard capture; filter controls aligned in one band; chart titles placed immediately above plots; three KPI values have consistent magnitude and baseline. Source images have baked-in text and graphics, so font metrics cannot be recovered reliably.

**Procus recipe (P1):** a quiet 3–4 metric strip above charts or the main table, with one typographic hierarchy for label/value/context. Use white surfaces and thin vertical dividers rather than colored metric cards. Trend lines need axes, units, and a clear comparison interval. Avoid inventing precision from the screenshot's raster font sizes.

## Original agent-alert demo proposal

This is a Procus interaction proposal, not an observed Salesforce component:

1. A compact alert row in Overview and Workflow: **Bearing housing increased 18.4%**. Secondary line names the supplier, previous and current unit cost, and annual spend impact. One action: **Generate negotiation plan**.
2. The action opens a review panel. Show target price, evidence, leverage, and proposed negotiation steps. The workflow advances to Prepared.
3. **Draft supplier message** produces an editable local draft addressed to the supplier. The workflow advances to Drafted.
4. Keep the message clearly labeled **Demo draft**. Require a real explicit send action for any external transmission; the demo need not send anything.

Keep the notification narrow enough that the user's primary tables remain visible. Prefer a notification icon with an actionable count over a permanent agent banner.

## Geometry corrections and exclusions

- Salesforce's reference controls are 32 px, not 40–48 px. Procus may use 34–36 px for comfort, but oversized actions will lose the enterprise density.
- The reference corner radius is 4 px. Avoid a universal 12–20 px radius.
- Table headers are sentence case, not widely tracked uppercase.
- Selection in navigation is an aligned strip, not a floating capsule.
- References include Salesforce orange object icons and prominent green workflow segments. Exclude their branded icon artwork and reinterpret with Procus's quieter visual language.
- The 729 px blueprint table is too narrow for its content. Fix column geometry instead of copying its truncation.
- Do not turn every KPI delta, agent state, category, and table status into a badge.

## Capture notes and gaps

SLDS2's current homepage is a newer Zeroheight site. These component sources are the official, live SLDS1 blueprint documentation; they must not be mislabeled as current SLDS2 components. Cookies were declined using available preference controls. A transient DNS issue was resolved using the hostname's public address returned by `dig`. No bot protection was bypassed. The dashboard is a screenshot embedded in official Salesforce training material, not an authenticated live Salesforce account. No live account or private data was used.
