# Procus

## Design status — read before building

**The current codebase has poor UI and UX. It is a rough prototype, not a design reference or an approved product experience.** The founder explicitly confirmed this on 19 September 2026.

**The design is not locked.** Collaborators and coding agents are free to redesign the information architecture, navigation, layouts, visual style, components, interaction flows, and frontend structure. Do not preserve an awkward experience just because it already exists. Screenshots, the exported HTML mockup, and older Markdown descriptions of dashboards, tabs, or cards are exploratory material, not acceptance criteria for the redesign. Earlier statements that a particular dashboard or tab arrangement was confirmed are superseded by this clarification.

Preserve the product intent and the meaning of the data: evidence-backed procurement decisions, comparable offers, distinct potential/agreed/realized savings, and separation of internal negotiation limits from supplier-facing material. Those principles do not prescribe a UI. Feature and research proposals below are not a locked implementation checklist. If a redesign changes which product capabilities are in scope, record that separately from the design decision.

## Product and research notes

- [Agent collaboration notes](AGENTS.md): explicit design freedom for collaborators and coding agents.
- [Product plan](procus-tuotesuunnitelma.md): product direction, open design decisions, and proposed next workflow.
- [Competitor research and differentiation](procus-kilpailijatutkimus.md): sourced market review, feature ideas, priorities, and validation plan.
- [Development proposals](procus-kehitysehdotukset.md): earlier reasoning and the latest research synthesis.
- [Original concept](procus.md): historical starting point with a current-status note.

## Current prototype

Interactive procurement workspace prototype. Five connected views:

- **Overview** — where spend stands, what is flagged, and what is waiting on a decision.
- **Parts & suppliers** — every part grouped by supplier, with a twelve-month price trend and a severity-ranked signal on each row.
- **Workflow** — each case from first signal to an agreed price, with owners, age and stalled counts per stage.
- **Agents** — what the agents have done, what they are doing now, their supplier conversations, and the decisions they are blocked on.
- **Spend** — annual spend, its trend, and the opportunity still open.

All views share the same fictional data: 49 parts across 8 European suppliers, about €25.7M of annual spend. The figures are generated from a fixed seed, so every reload, test run and screenshot shows the same numbers.

The interface uses an original enterprise design informed by measured Salesforce, Carbon, Fluent and procurement-product references. [DESIGN.md](DESIGN.md) links the master contract, source PNG gallery, UX principles and validation record.

## Run

Requires Node.js 20 or later. No packages need to be installed.

```sh
npm run dev
```

Open http://127.0.0.1:5173. To use a different port, run `PROCUS_PORT=5174 npm run dev`.

```sh
npm test
```

## Available interactions

- Filter parts by alert severity, case status, or a search across names, codes, suppliers and categories.
- Collapse or expand a supplier group. Groups always start expanded; collapse is not carried across reloads.
- Open any part for its price history, the evidence behind its signal, its annual impact and its next step.
- Change a case stage from the detail panel; the board and every spend total follow.
- Draft a supplier message from the evidence, or open the conversation an agent has already started.
- Approve, take over or defer the decisions an agent is blocked on; pause and resume individual agents.
- Move between views from the alerts, the pipeline and the agent activity feed.
- Stage changes, the active view, selection, filters, handled decisions and paused agents persist in this browser using localStorage.

## Deck-aligned demo

Overview → **Generate framework** on TM-105 Aluminium housing. The shared example shows price +12%, aluminium +3%, internal comparable −8% and an indicative alternative −11%. The framework proposes an opening ask of −10% (€20.16) and an internal LAA of −6% (€21.06) against the current €22.40 price.

**Draft supplier message** opens editable subject/body and Copy. The private LAA never enters generated supplier text. **Find alternatives** → **Run RFQ agent demo** → **Prepare RFQ draft** demonstrates optional sourcing. It is local and illustrative: no remote agent runs and no suppliers are contacted. Drafts persist only while the preparation session remains open.

The overview prioritises portfolio monitoring and parts requiring action, with historical spend beneath. Workflow uses a compact finding; Agents puts the roster alongside expandable decisions. The source PNGs in `docs/design-references` are research material, not shipped application assets.

## What the numbers mean

All suppliers, prices, signals and volumes are fictional. Three savings figures are deliberately kept apart and must never be added together:

- **Identified** — what the evidence suggests is available. Assumes the whole example volume moves to the reference price, with no freight, tooling or qualification cost.
- **Agreed** — what a supplier has confirmed, expressed as an annual run rate. A subset of identified.
- **Realised** — only the months already invoiced at the agreed price. A subset of agreed. Marking a case Agreed in the workspace realises nothing until purchases are recorded.

Cases marked **No action** are excluded from opportunity totals. Summary figures always cover all parts, while supplier subtotals reflect the visible filtered rows. Reference prices are benchmarks used to open a discussion, not internal negotiation limits.

This version has no backend, authentication, live supplier data, integrations or external messaging. Nothing is sent to a supplier. Browser state is local to the current browser and origin.

## Structure

- `index.html`: application shell — global header and view navigation.
- `DESIGN.md`: entry point to the master design contract, captured reference PNGs and validation notes.
- `src/evidence.js`: shared price/index/comparable evidence display.
- `src/negotiation.js`: internal framework and editable supplier draft.
- `src/rfq.js`: optional local RFQ preparation demo and supplier-facing request.
- `src/styles.css`: the design tokens and every component rule.
- `src/data.js`: fictional parts, suppliers, agents and supplier conversations.
- `src/model.js`: spend, severity, pipeline and savings calculations, and validated browser persistence.
- `src/chart.js`: the SVG sparklines, price chart, spend chart and proportion bars.
- `src/views.js`: the markup for each view and the detail panel.
- `src/app.js`: state, events and rendering.
- `server.mjs`: dependency-free local server; serves only the shell and `src` sources, under a strict Content-Security-Policy.
- `tests/model.test.js`: data, calculation and persistence checks.

The concept documents remain separate from the implementation.
