# Enterprise component research for Procus

Captured 19 September 2026 using an independent headless Chrome browser through Playwright. Viewport 1440 × 1000 CSS pixels, device scale 1. All full screenshots and all listed component crops were opened and visually reviewed. These are official, rendered public component demos, not marketing mockups or local imitations. No credentials, bot-wall bypasses, or proprietary app sessions were used.

**Identity filter:** Procus is an operational procurement workspace. Parts, supplier prices, negotiations, and agent work deserve the visual emphasis. Use enterprise structure and restraint while preserving Procus terminology, original icons, and restrained brand color.

## Evidence index

| Reference | Official live source | PNG evidence | Verified geometry / appearance |
|---|---|---|---|
| Carbon toolbar data table | [Live table](https://react.carbondesignsystem.com/iframe.html?globals=theme:white&id=components-datatable-toolbar--default) | [Full](carbon-table.png), [tight crop](carbon-table-crop.png) | 48px header and body rows; 16px horizontal cell padding; 14px text; 600-weight headers; hairline horizontal rules; flat surfaces; plain text status |
| Carbon line tabs | [Live tabs](https://react.carbondesignsystem.com/iframe.html?globals=theme:white&id=components-tabs--default) | [Full](carbon-tabs.png), [tight crop](carbon-tabs-crop.png) | 40px high; 16px horizontal padding; 14px type; selected label 600 weight; 2px blue bottom rule; no pill container |
| Fluent data grid | [Live grid](https://react.fluentui.dev/iframe.html?id=components-datagrid--default&viewMode=story) | [Full](fluent-datagrid.png), [tight crop](fluent-datagrid-crop.png) | 33px rendered header; 45px rendered rows including 1px separator; 14/20px typography; restrained outline icons and compact selection cells |
| Fluent inline detail drawer | [Live drawer](https://react.fluentui.dev/iframe.html?id=components-drawer--inline&viewMode=story) | [Closed](fluent-drawer.png), [opened on right](fluent-drawer-open.png), [tight crop](fluent-drawer-crop.png) | 320px wide; header 64px high; 24px left/right content padding; header/body/close control; preserves parent content alongside |
| Fluent navigation | [Live navigation](https://react.fluentui.dev/iframe.html?id=components-nav--basic&viewMode=story) | [Full](fluent-nav.png), [tight crop](fluent-nav-crop.png) | 260px wide; 14/20px typography; #f0f0f0 background; concise labels; narrow blue active indicator; outline icons without tile backgrounds |

The table/tabs/grid/drawer include `*-snippet.html` and computed `*-metrics.json`. Navigation includes rendered full HTML and metrics, with a pixel crop of the observed navigation bounds. [effective-styles.css](effective-styles.css) reconstructs the measured rules; it is explicitly not a verbatim upstream CSS extract.

## Tier 1: apply now

### E1. One shared spend-table contract (small effort)

Use Carbon's predictable row geometry and Fluent's quieter surface. Every table must share the same cell insets, alignment rules, type scale, and action-column width. Start with **48px rows, 40px column header, 16px cell insets, 14/20px body type, 12–13px column labels, and 1px neutral separators**. These dimensions are a proposed Procus synthesis; Carbon's captured header is 48px, not 40px.

Use actual semantic tables (or one shared grid schema), with right-aligned prices, spend, percentages, quantities, and their headers. Apply `font-variant-numeric: tabular-nums`. Keep currency precision consistent per column. For a sortable numeric header, put the arrow in a reserved slot so sorting does not shift the label. First identifying column stays left aligned; center alignment is reserved for checkboxes and icon-only controls. These numeric conventions are Procus recommendations, **not visible evidence from the captured Carbon port-number column**, which is left aligned.

Do not put flex containers directly on table cells in ways that destroy shared column sizing. Use an inner wrapper when necessary. A monetary value and its header must terminate on the exact same x coordinate. Empty values use one consistent dash and occupy the same cell. Short labels stay vertically centered; two-line part names use a deliberate 56–64px row variant across the whole table, never accidental mixed spacing.

### E2. Quiet page tabs (small effort)

Adopt the measured Carbon 40px height, 16px side inset, 14px label, and 2px active underline. Keep page tabs aligned with the table/content edge. Remove pill backgrounds and repeated badges on every tab. Count labels should appear only when they change the decision: for example, “Needs review (3)”.

### E3. Navigation that labels the product (medium effort)

Fluent demonstrates compact semantic icons and a single clear active state. For Procus, use a 224–240px rail, 40px items, 20px custom line icons on consistent 24px viewboxes, 12px icon-to-text gap, and one blue selection treatment. The rail and icon sizes are **Procus recommendations**, not extracted Fluent measurements except the reference's 260px rail width.

Suggested icon concepts: Overview = split dashboard panes; Products = three interlocking assembly plates; Spend = bar chart with a small currency marker; Negotiations = paired conversation strokes; Workflow = connected nodes with a forward arrow; Agents = two nested circles with a small signal notch. Use the same stroke weight and optical box. Avoid rainbow tiles, sparkles on every page, pulsing status dots, and tiny AI badges attached to headings.

### E4. Agent alert → focused contextual drawer (medium effort)

The captured Fluent drawer preserves the table context, uses a concise heading, and has a predictable close action. Use the same anatomy with a **440–480px Procus width** (proposed, wider than the measured 320px default to accommodate negotiation material).

For the requested demo, one quiet actionable row in Overview or Workflow says “Price increase detected · Part AX-204 · +18.4%”. Its primary action is “Generate framework”. Open the right drawer with the exact part/supplier context and a short three-line evidence summary. After generation, show target price, leverage, and proposed terms, then one primary “Draft supplier message” action. The final state is an editable message with subject, recipient, and a saved-draft confirmation. Do not send anything in a visual demo. Keep generation states and failures local to the affected section; reserve global notifications for outcomes that matter across the app.

[Fluent drawer guidance](https://fluent2.microsoft.design/components/web/react/core/drawer/usage) recommends contextual content, consistent placement, and short two-to-three-step drawer flows. This supports the proposed sequence; it does not provide the negotiation content itself.

## Tier 2: apply through the same system

| Procus surface | Recommended treatment | Evidence / confidence |
|---|---|---|
| Metric strip | 3–4 essential values; 12–13px neutral label, 28–32px value, one short delta; shared baseline; vertical separators instead of four competing cards | Original synthesis; no metric strip was captured in this research set |
| Trends | One main line series in brand blue, gray axes, modest grid lines, legible units, short legend; no surrounding insight banner unless actionable | Original recommendation; not a captured chart |
| Forms | Labels above fields; 8px label-to-input gap; 16–24px field spacing; 36–40px controls; helper/error copy directly below the related control | Proposed Procus scale. Captured Fluent buttons are 32px high, 14/20px text, 4px corner radius |
| Assemblies / parts | Object identity first, subordinate part ID on the second line, plain-text secondary metadata; row action opens the same detail surface | Fits table evidence; content hierarchy is Procus-specific |
| Negotiation status | One status field per record; neutral text for ordinary progress, restrained amber for required attention; no duplicate phase chips in title, row and summary | Carbon table uses ordinary text rather than a pill on every status |
| Agent runs | Show running/needs-input/completed text alongside agent name and last activity. Use a small live indicator only for genuinely running work | Original recommendation based on restraint in captured navigation/table |

## Geometry corrections and guardrails

- **Measured, not estimated:** Carbon rows/header 48px, Carbon tabs 40px, 16px insets, 2px tab rule, Fluent grid 45px rendered rows, Fluent drawer 320px, drawer header/body 24px horizontal padding, Fluent navigation 260px.
- **Proposed, not extracted:** Procus 40px table header, 224–240px navigation, 440–480px negotiation drawer, metric strip typography, right-aligned spend conventions, and 8px-based page spacing.
- Carbon's large 134px title/toolbar band is too tall for Procus's dense spend workspace. Compress title/actions into a single 56px band. Keep its alignment discipline, not that full vertical overhead.
- Carbon's #e0e0e0 table header is visually heavier than Procus needs. Prefer a lighter neutral header. Do not copy IBM's zero-radius buttons everywhere; Procus can use consistent 4–6px corners.
- Fluent's avatar presence markers belong to collaboration identities. Do not reproduce them as decorative agent health badges.
- The navigation demo scrolls inside a fixed 600px example area. This is Storybook framing, not evidence that Procus's rail should be only 600px tall.
- Do not infer spacing from screenshot display scaling. Use the recorded CSS-pixel metrics and PNG native dimensions.

## Supporting official reading

- [Carbon data-table implementation](https://carbondesignsystem.com/components/data-table/code/)
- [Carbon tab style guidance](https://carbondesignsystem.com/components/tabs/style/)
- [Fluent navigation guidance](https://fluent2.microsoft.design/components/web/react/core/nav/usage)
- [Fluent drawer guidance](https://fluent2.microsoft.design/components/web/react/core/drawer/usage)
- [SAP responsive table](https://experience.sap.com/fiori-design-web/responsive-table/) — supplemental reading only, **not captured**. Useful for deciding which identifying columns remain visible at narrow widths and avoiding unreadably compressed columns. No SAP-specific pixel dimensions are claimed.

## Rejected patterns

Oversized banner introductions, colored badge clusters, multiple full-width “AI insights” cards, decorative gradient KPI blocks, redundant status repeats, and per-row card shadows all compete with the operational information. The evidence favors a composed workspace: plain surfaces, consistent geometry, meaningful selection, and context revealed on demand.
