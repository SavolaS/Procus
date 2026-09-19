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

Interactive procurement workspace prototype. Three connected views split the workflow: **Products & suppliers** for inventory and flags, **Workflow** for case status, and **Spend** for the effect of agreed price changes. All views share the same fictional data: three manufacturers and nine products.

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

- Expand or collapse manufacturers and inspect each product.
- Search by name, product code or manufacturer.
- Filter flagged products and case statuses.
- Change status in the product detail panel.
- Mark a case **Agreed** to include its example target price in projected spend; reopen it to remove that impact.
- Open an internal negotiation outline.
- Switch between all three views; a status change is reflected in the board and spend totals.
- Statuses, active view, selection and filters persist in this browser using localStorage.

All suppliers, prices, flags and volumes are fictional demo data. Potential savings include agreed savings; the two must not be added together. Spend after changes assumes the entire example volume moves to the target price, without additional costs. These are scenarios, not realized savings. Summary figures always cover all products, while manufacturer subtotals reflect visible filtered rows.

This version has no backend, authentication, live supplier data, integrations or external messaging. Browser state is local to the current browser and origin.

## Structure

- `index.html`: application shell.
- `src/styles.css`: responsive light and dark appearance.
- `src/app.js`: interactions and rendering.
- `src/data.js`: fictional products and status options.
- `src/model.js`: spend calculations and validated browser persistence.
- `server.mjs`: dependency-free local server; only application assets are served.
- `tests/model.test.js`: spend and persistence checks.

The concept documents remain separate from the implementation.
