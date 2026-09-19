# Procus UX principles and iteration acceptance criteria

Researched 19 September 2026 from primary design guidance. Product intent supplied by the redesign brief: **make every product negotiable through continuous portfolio monitoring, while the human retains the supplier relationship.** These rules are proposed Procus applications of the cited guidance; they are not vendor specifications or claims about functionality already implemented.

## Sources

Four source organizations; the two Salesforce pages distinguish broad design principles from concrete component behavior.

- **Nielsen Norman Group:** [Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/) — defer secondary complexity while preserving access to it.
- **Microsoft Research:** [Guidelines for human-AI interaction design](https://www.microsoft.com/en-us/research/blog/guidelines-for-human-ai-interaction-design/) — make capabilities and explanations understandable; time interruption to context; support dismissal, correction and control.
- **Google PAIR:** [Explainability + Trust](https://pair.withgoogle.com/chapter/explainability-trust/) — explain recommendations in usable terms and calibrate trust; confidence scores can be hard to interpret.
- **Salesforce:** [Introduction to SLDS](https://developer.salesforce.com/docs/platform/salesforce-pages-developers-guide/guide/vf-dev-best-practices-slds-intro.html) — clarity, efficiency, consistency and craft; [Datatable reference](https://developer.salesforce.com/docs/platform/lightning-component-reference/guide/lightning-datatable.html) — typed values, formatting, alignment, selection, sorting and row actions.

## 1. Show the decision before its supporting machinery

**Basis:** NN/g progressive disclosure; Salesforce clarity and efficiency.

**Procus acceptance:** Overview leads with actionable parts and negotiation status. A part alert contains its name, supplier, material price change, date and one primary action: **Generate framework**. History, sources and assumptions open through a clearly labeled Evidence control. A person can identify the part and next action without reading an AI introduction. Portfolio totals remain subordinate to the work queue. Do not hide the reason for an alert behind an unlabeled icon.

**Components:** Overview attention list, part detail, negotiation drawer.

## 2. Explain the recommendation with comparable evidence

**Basis:** Google PAIR explainability; Microsoft guideline 11 on access to explanations.

**Procus acceptance:** The hero SKU shows four separately labeled facts: **part price +12%; aluminium index +3%; internal comparable −8%; alternative supplier −11%**. Each fact has a baseline, period and source label, with limitations visible in Evidence. The price and index series must use the same comparison window before being juxtaposed. Internal comparables expose specification/volume differences. Alternatives expose qualification, freight, lead time and quotation status. An index is a contextual material signal, never a proxy for total manufacturing cost. No decorative “98% confidence” is added without a validated interpretation.

**Components:** Evidence strip, trend chart, source rows, negotiation rationale.

## 3. Keep supplier communication under human control

**Basis:** Microsoft guidelines for invocation, dismissal, correction and consequence awareness; PAIR's trust calibration.

**Procus acceptance:** Generating a framework, drafting a message and sending a message are distinct operations. Generated subject and body are editable. The internal **LAA −6%** is displayed in an internal-only field and excluded from every supplier-facing preview, clipboard message and draft. A demo ends with **Save draft** or Copy; neither action contacts a supplier. In a future connected send flow, the user reviews the exact recipient and message before transmission. Source labels describe actual capabilities: “Demo analysis” rather than pretending a remote agent performed fresh checks.

**Components:** Framework, draft composer, copy/save actions, activity record.

## 4. Interrupt only for a change that deserves action

**Basis:** Microsoft guidelines 3, 4 and 8: contextual timing, relevance and efficient dismissal.

**Procus acceptance:** A price flag appears once in Needs attention. Opening it does not create a second toast and another banner. Alert color is limited to the relevant icon or metric; running agents and ordinary progress use quiet status text. Offer **Review later** and **Dismiss**, preserving the record in activity. A dismissed flag resurfaces only when its evidence materially changes or its explicit reminder becomes due. In the demo, automatic reruns must not repeatedly announce unchanged +12% drift. Completed generation updates the existing item's status and announces completion accessibly without taking focus away.

**Components:** Attention queue, notification indicator, agent progress, activity feed.

## 5. Use one table grammar across the whole portfolio

**Basis:** Salesforce typed datatable behavior and SLDS consistency. Dimensions below are Procus choices, not extracted Salesforce tokens.

**Procus acceptance:** Assemblies, parts, spend and negotiations use the same 36 px header and 48 px single-line / 60 px two-line row options, with 16 px horizontal cell padding. Text and its header align left; currency, quantity and percent columns and their headers align right, with tabular numerals. Sort arrows do not move the alignment edge. Mixed currencies retain their currency code; missing values use an em dash and never become zero. Selection, expansion and overflow actions occupy dedicated columns. A part link is keyboard reachable; buttons work without requiring a row click. Table controls use one toolbar and the same terms across pages.

**Components:** Shared table, numeric formatter, status label, filter bar, row actions.

## 6. Reveal the negotiation as a short, reversible sequence

**Basis:** NN/g disclosure; Microsoft correction and consequence awareness.

**Procus acceptance:** **Flag → Framework → Opening ask → Draft**, with **Explore alternatives / Prepare RFQ** as an optional branch. The framework states an **opening ask of −10%** and an **internal LAA of −6%**, each relative to the currently quoted unit price; these are proposed negotiation positions, not achieved savings. Users can edit assumptions and return to the framework without losing the draft. Preparing an RFQ does not imply switching supplier, supplier qualification, or sending. The existing supplier remains the default relationship unless the user chooses otherwise.

**Components:** Negotiation stages, framework editor, optional RFQ panel, draft persistence.

## 7. Preserve financial meaning from chart to copy

**Basis:** Salesforce clarity/typed formatting and PAIR understandable explanations. The rules below are domain-specific Procus requirements.

**Procus acceptance:** Every percentage has a denominator and meaning. **+12%** is a historical change; **+3%** is an index movement; **−8%** and **−11%** are comparison gaps; **−10%** is an opening proposal; **−6%** is an internal negotiating threshold. They must not share a generic “Savings” heading. Do not add the 8% and 11% gaps. Any potential annual impact needs a stated volume and eligible baseline; realized savings requires an accepted price and a defined measurement basis. “Price rose 9% above the index” is invalid: a 12% versus 3% change is a **9 percentage-point difference in growth**, not proof of 9% unjustified total cost. The difference in their normalized ratios is a separate quantity and likewise not proof of savings.

**Components:** KPI labels, trend tooltip, comparison table, framework, supplier draft.

## 8. Make visual consistency a measurable property

**Basis:** Salesforce consistency and craftsmanship; NN/g focus on the primary task.

**Procus acceptance:** All page headings share one baseline, size and action placement. Status vocabulary and colors mean the same thing on Overview, Workflow and Negotiations. No badges merely label “AI”, “smart”, “live” or the current page. Page gutters and panel gaps use shared tokens; one primary action is visually strongest per active work surface. Body text remains readable at normal browser zoom. At 1440 px, spend headers and cells align without clipping; at narrower widths the data region scrolls or adapts without the whole page overflowing. Focus is visible, drawer focus returns to its trigger, and alert meaning survives grayscale.

**Components:** Application shell, sidebar, page header, panels, dialogs, tables.

## Two iteration passes

These are acceptance targets, not a statement that verification has already happened.

| Pass | Required review | Observable completion evidence |
|---|---|---|
| **1 — hierarchy and coherent behavior** | Remove redundant decoration; normalize page/table patterns; implement exact hero facts and flag → framework → draft flow; keep alternatives optional. | Desktop screenshots of Overview, Parts/Assemblies, Spend, Negotiations and Workflow; demonstration of saved editable draft; no public LAA or fabricated savings. |
| **2 — precision and recovery** | Compare against reference crops; correct alignment, wrapping, semantic labels, keyboard behavior and narrower layouts; exercise dismissal and return-to-edit. | Before/after crops for spend table and notification; screenshot of framework + draft; keyboard walkthrough; clean console; narrow viewport with no document-level overflow. |

## Hero scenario contract

Use one shared scenario object so evidence, framework, chart, opening message and activity cannot disagree:

| Field | Exact demo value | Required label/context |
|---|---:|---|
| Part price movement | +12% | Same-SKU historic baseline and period |
| Aluminium index movement | +3% | Matching period; material context only |
| Internal comparable gap | −8% | Versus current quote; comparability caveat |
| Alternative supplier gap | −11% | Versus current quote; qualification/landed-cost caveat |
| Opening ask | −10% | Proposed reduction from current quoted unit price |
| Internal LAA | −6% | Internal negotiating threshold; never sent to supplier |

Do not import the earlier generic €2.28 → €2.70 / +18.4% research example into this hero scenario. That was an illustrative recommendation before the deck-specific brief supplied the authoritative demo values.
