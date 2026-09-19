# Procus redesign — validation and iteration record

Date: 19 September 2026. Scope: the local application at http://127.0.0.1:5173 and source in the Procus repository.

## Iterations completed

| Pass | Finding | Change | Evidence |
|---|---|---|---|
| 1 — shared enterprise foundation | Repeated red banners, coloured KPI borders, badges and large path arrows competed with work; Spend bar cells broke the table formatting context. | Quiet original navigation and icon family; one metric strip; regular typography/insets; true table cells with nested share layouts; detail drawer and preparation dialog. | Salesforce, Carbon, Fluent and Ramp crops mapped in MASTER-DESIGN.md. |
| 2 — deck and decision flow | Spend reporting dominated the product story; no opening ask/LAA or optional RFQ path. | 49/49 products monitored; priority parts before chart; coherent TM-105 evidence; proposed opening −10%, internal LAA −6%; editable supplier and RFQ subject/body. | overview-desktop.png, negotiation-framework.png, supplier-draft.png, rfq-alternatives.png. |
| 3 — usability convergence | Workflow repeated the full evidence panel; approval cards pushed running agents out of view; mobile button squeezed finding copy; table card minimum width escaped its container. | Compact Workflow finding; roster first with expandable decisions alongside; explicit mobile finding grid; minimum width on the table only; focus restored to originating part after preparation. | workflow-desktop.png, agents-desktop.png, overview-mobile.png, parts-mobile.png. |

## Automated checks

- `npm test`: 28 tests passed, 0 failures.
- Existing model tests preserve separate potential, agreed and realised savings and validated browser persistence.
- Added tests for selected-part supplier copy, HTML escaping of draft content, unknown/no-opportunity handling, exact deck figures, and exclusion of internal fields from supplier-facing generation.
- Five RFQ tests cover explicit demo completion, no fabricated quotes for other SKUs, private-field exclusion, escaped source strings and missing specification disclosure.
- `node --check` on edited JavaScript and `git diff --check` passed.

## Browser checks performed

- Inspected all five top-level pages in the running application before and after redesign.
- Responsive checks at 1440×1000, 1024×900 and 390×844. After fixes, document scroll width equals viewport width on every page. Parts/Spend tables, mobile navigation and narrow charts scroll inside their own containers.
- Spend table measured at 1440px: header and body share the same column positions; currency columns right aligned; share containers remain table cells. Percentage bar denominator is total spend, matching the printed percentage.
- Parts search found TM-105; clearing by keyboard restored all 49 rows. Critical filter returned 9; Negotiating returned 7. Supplier collapse/expand updates `aria-expanded`.
- Changed TM-105 from Under review to Negotiating and back; browser save confirmation appeared. No test stage change left behind.
- Paused and resumed Price Watch: running count changed 3 → 2 → 3. Original state restored.
- Completed Overview finding → framework → supplier draft → copy. Copy confirmation was shown. Edited body survived Back → Draft in the active preparation session.
- Completed optional Find alternatives → Run RFQ agent demo → Prepare RFQ draft. TM-105 produces two clearly illustrative candidate records, only one with a simulated quote; generated RFQ text has no LAA or internal strategy.
- Keyboard Escape closes panels; Tab and Shift+Tab remain inside the framework. Closing preparation entered from part detail restores focus to the originating row. Underlying interface becomes inert while a dialog is open.
- Core colour pairs checked: default text/white 13.33:1; secondary 6.32:1; muted 5.05:1 (4.75:1 on canvas); action blue/white 5.54:1. Control borders were darkened to clear 3:1 on white. This is a targeted token check, not a complete accessibility certification.
- No warnings or errors appeared in the browser console during the final checks.

## Shared scenario and arithmetic

TM-105 Aluminium housing, conveyor drive module, Tekno Metal AB. €20.00 → €22.40 (+12%); aluminium +3% over the same twelve months; internal comparable −8% and alternative −11% versus the current unit price. These are different comparison bases and are not added/subtracted as savings.

Opening: €22.40 × 0.90 = €20.16. Internal LAA: €22.40 × 0.94 = €21.056, displayed €21.06. Indicative alternative: €22.40 × 0.89 = €19.936, displayed €19.94. Annual opening opportunity: (€22.40 − €20.16) × 26,000 = €58,240. No agreement or realised saving is created by generating a framework or draft.

Portfolio baseline €25,736,290; identified €1,487,271; agreed €185,032; realised €34,469; open opportunity €1,302,239. Adjusting the hero sample updated every shared calculation and model test coherently.

## Explicit limits

This remains a local prototype with fictional data. It does not execute remote AI, retrieve fresh index/quote data, connect email, send messages, qualify suppliers or place orders. The RFQ run is a local demonstration. Generated drafts remain editable within the open preparation session; closing/reloading does not durably save them. Supplier dependency is not invented when revenue/qualification data is missing. Full screen-reader, cross-browser, production security and assistive-device certification were not performed.

## Captures

[Overview](overview-desktop.png) · [Parts](parts-desktop.png) · [Workflow](workflow-desktop.png) · [Agents](agents-desktop.png) · [Spend](spend-desktop.png) · [Framework](negotiation-framework.png) · [Supplier draft](supplier-draft.png) · [RFQ](rfq-alternatives.png) · [Mobile](overview-mobile.png).
