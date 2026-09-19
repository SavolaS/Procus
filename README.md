# Procus

## Design status — read before building

**The current codebase has poor UI and UX. It is a rough prototype, not a design reference or an approved product experience.** The founder explicitly confirmed this on 19 September 2026.

**The design is not locked.** Collaborators and coding agents are free to redesign the information architecture, navigation, layouts, visual style, components, interaction flows, and frontend structure. Do not preserve an awkward experience just because it already exists. Screenshots, the exported HTML mockup, and older Markdown descriptions of dashboards, tabs, or cards are exploratory material, not acceptance criteria for the redesign. Earlier statements that a particular dashboard or tab arrangement was confirmed are superseded by this clarification.

Preserve the product intent and the meaning of the data: evidence-backed procurement decisions, comparable offers, distinct potential/agreed/realized savings, and separation of internal negotiation limits from supplier-facing material. Those principles do not prescribe a UI. Feature and research proposals below are not a locked implementation checklist. If a redesign changes which product capabilities are in scope, record that separately from the design decision.

## Product and research notes

- [Pitch outline](procus-pitch.md): founder-provided positioning, customer example, workflow, and illustrative demo.
- [Agent collaboration notes](AGENTS.md): explicit design freedom for collaborators and coding agents.
- [Product plan](procus-tuotesuunnitelma.md): product direction, open design decisions, and proposed next workflow.
- [Competitor research and differentiation](procus-kilpailijatutkimus.md): sourced market review, feature ideas, priorities, and validation plan.
- [Development proposals](procus-kehitysehdotukset.md): earlier reasoning and the latest research synthesis.
- [Original concept](procus.md): historical starting point with a current-status note.
- [Technical ambition and pricing implementation](research/technical-ambition.md): BOM pricing engine, real index connectors, research findings and remaining validation work.

## Current prototype

Procurement workspace with a persistent local backend and an offline demo. Five connected portfolio views:

- **Overview** — where spend stands, what is flagged, and what is waiting on a decision.
- **Parts & suppliers** — every part grouped by supplier, with a twelve-month price trend and a severity-ranked signal on each row.
- **Workflow** — each case from first signal to an agreed price, with owners, age and stalled counts per stage.
- **Agents** — supplier discovery, reviewed RFQ dispatch, a persistent outbox, and searchable material index sources. The original fictional agent activity remains labelled below the backend workflow.
- **Spend** — annual spend, its trend, and the opportunity still open.

The portfolio views share the same fictional data: 49 parts across 8 European suppliers, about €25.7M of annual spend. The figures are generated from a fixed seed, so every reload, test run and screenshot shows the same numbers. Automatic BOM/index analysis attaches cost findings to the portfolio and negotiation framework; it does not turn a cost scenario into agreed savings.

The interface uses an original enterprise design informed by measured Salesforce, Carbon, Fluent and procurement-product references. [DESIGN.md](DESIGN.md) links the master contract, source PNG gallery, UX principles and validation record.

## Run

Requires Node.js 20 or later. No packages need to be installed.

```sh
npm run dev
```

Open http://127.0.0.1:5173. To use a different port, run `PROCUS_PORT=5174 npm run dev`.

To serve devices on the same local network, run `PROCUS_HOST=0.0.0.0 npm run dev` and open `http://<this-computer-LAN-IP>:5173` on the other device. The default remains loopback-only.

```sh
npm test
```

## Backend demo and live connections

The default remains credential-free and offline. Open **Agents → Find demo suppliers → Prepare RFQ**, review the recipient and request, then **Simulate RFQ email**. Runs, leads, drafts and simulated dispatches persist across reloads and server restarts. No external service is contacted in the default configuration.

Live mode uses the **OpenAI Agents API** with web search for sourced supplier discovery and a narrowly scoped function tool for approved RFQ dispatch through **Resend**. Material indices have a separate credential-free public-data mode with scheduled acquisition, searchable coverage and retained source vintages. Credentials stay on the server; existing mock portfolio data is preserved.

See [backend setup and API](backend/README.md) and [.env.example](.env.example) for enabling each connection, limits, and integration details. No packages need installing.

## Available interactions

- Filter parts by alert severity, case status, or a search across names, codes, suppliers and categories.
- Collapse or expand a supplier group. Groups always start expanded; collapse is not carried across reloads.
- Open any part for its price history, the evidence behind its signal, its annual impact and its next step.
- Change a case stage from the detail panel; the board and every spend total follow.
- Draft a supplier message from the evidence, or open the conversation an agent has already started.
- Approve, take over or defer the decisions an agent is blocked on; pause and resume individual agents.
- Move between views from the alerts, the pipeline and the agent activity feed.
- Stage changes, the active view, selection, filters, handled decisions and paused agents persist in this browser using localStorage.

## Hackathon demo workflow

Open [the demo entry](http://127.0.0.1:5173/?demo=1) to start on **Overview**, regardless of the previously saved tab.

1. **Review negotiation basis** — the featured TM-105 Aluminium housing case shows a 12% increase (€20.00 → €22.40) and €58,240 potential annual savings at the proposed opening. Review the illustrative internal comparable (−8%) and alternative quote (−11%), their sources and validation gaps. Material context stays separate from verified cost analysis.
2. **Build negotiation framework** — review the opening ask of **−10% (€20.16/unit)** and the internal **LAA of −6% (€21.06/unit)**, plus the recommended approach and escalation boundary.
3. **Continue to Agents** — the same case appears at the top of Agents with its internal brief and a concrete preparation task.
4. **Prepare supplier draft** — review and edit the subject and message. The generated supplier text includes the opening ask and never includes the LAA. Copy is available; no supplier is contacted.

**Restart demo** in the agent brief returns to Overview and clears only this demo's preparation state. Procurement stages and savings remain unchanged. The handoff survives reloads; draft edits last for the current page session. All demo comparisons and buyer targets are illustrative.

The part-detail framework also offers **Find alternatives** → **Open supplier discovery**, which carries the selected part into the backend sourcing workspace. Starting a search and dispatching an RFQ follow the configured demo/live modes and the same review flow. The source PNGs in `docs/design-references` remain research material, not shipped application assets.

## What the numbers mean

All suppliers, prices, signals and volumes are fictional. Three savings figures are deliberately kept apart and must never be added together:

- **Identified** — what the evidence suggests is available. Assumes the whole example volume moves to the reference price, with no freight, tooling or qualification cost.
- **Agreed** — what a supplier has confirmed, expressed as an annual run rate. A subset of identified.
- **Realised** — only the months already invoiced at the agreed price. A subset of agreed. Marking a case Agreed in the workspace realises nothing until purchases are recorded.

Cases marked **No action** are excluded from opportunity totals. Summary figures always cover all parts, while supplier subtotals reflect the visible filtered rows. Reference prices are benchmarks used to open a discussion, not internal negotiation limits.

The portfolio data, original conversations and savings remain illustrative. Case stages and filters stay in browser storage; the new sourcing workflow and outbox persist in the local backend. Default demo mode never contacts suppliers. Live connections require explicit server configuration, and live workspace requests require an access token. The workspace automatically requests portfolio cost analysis from the local server. Public index snapshots are real; prototype BOMs, lag assumptions and purchase histories are illustrative. This is a single-process local backend, not a multi-tenant hosted deployment.

## BOM and index pricing

Cost analysis runs automatically in the local server and appears in the existing overview, part evidence and negotiation framework. No calculator or pricing tab is required. Each result explains why the price merits review, why cost evidence does not support a reduction, or which evidence is missing. The demo evaluates bundled evidence automatically when it starts. No live feeds, polling or external service calls are needed.

The server pairs supported BOM records with the correct saved index series, accounts for yield and material exposure, applies the documented index lag, and compares the scenario range with the current purchase price. Unsupported material mappings do not inherit another material's index. Sources, observation periods, assumptions and missing inputs are retained with each finding.

To see the index comparison, open **Steel plate · NF-101** from Overview's priority list (or search in Parts & suppliers). Its automatic evidence shows monthly **price paid**, **BOM cost estimate** and **material index** on a common baseline of 100, with the lag and source periods labelled. The gap highlights a reason for review; expandable evidence explains material coverage and offers. No comparable-price history is invented, and a missing monthly input suppresses the chart. Other mapped examples are NF-118, NF-355 and LE-064.

```sh
npm run pricing:fetch
npm run pricing:fetch:statfin
npm run pricing:analyze
```

These remain developer ingestion/diagnostic commands. The backend can now refresh public sources on startup, on a schedule and from Agents when `PROCUS_INDEX_MODE=live`; successful or failed refreshes invalidate the pricing cache without a restart. Defaults use bundled snapshots for reproducible offline replay. The catalog distinguishes broad basic-metals, steel, copper, aluminium and plastics producer-price proxies; unsupported or suppressed observations stay unavailable. Discovering a series does not automatically approve a BOM mapping. Developer edits to BOM records still require a restart.

Comparable-price checks run alongside the cost model. Quotes must match specification, revision, unit, order quantity, delivery basis and approval, with known landed costs and valid dates. Price packs are normalized explicitly. Expired or incomplete offers are excluded with reasons; historical purchases stay separate from current quotes. Current offer fixtures are illustrative, not actual supplier availability. A quote and a BOM estimate remain separate outputs; neither automatically changes an opening target, LAA or savings ledger.

`npm test` covers calculation, quote eligibility, cached automatic analysis, evidence display and connector edge cases. [Technical ambition and evidence](research/technical-ambition.md).

## Structure

- `index.html`: application shell — global header and view navigation.
- `DESIGN.md`: entry point to the master design contract, captured reference PNGs and validation notes.
- `src/evidence.js`: shared price/index/comparable evidence display.
- `src/negotiation.js`: internal framework and editable supplier draft.
- `src/rfq.js`: sourcing handoff and allowlisted supplier-facing RFQ template.
- `src/styles.css`: the design tokens and every component rule.
- `src/data.js`: fictional parts, suppliers, agents and supplier conversations.
- `src/model.js`: spend, severity, pipeline and savings calculations, and validated browser persistence.
- `src/chart.js`: the SVG sparklines, price chart, spend chart and proportion bars.
- `src/views.js`: the markup for each view and the detail panel.
- `src/app.js`: state, events and rendering.
- `src/pricing.js`: sourced BOM cost scenarios, lag/FX handling and evidence validation.
- `src/automatic-pricing.js`: automatic portfolio assessment and price-review reasons.
- `src/reference-prices.js`, `src/reference-data.js`: comparable-quote validation and illustrative reference records.
- `pricing-service.mjs`: automatic bundled-evidence analysis, shared cache and stable evidence versions.
- `src/bom-data.js`: versioned illustrative BOM records and explicit material mappings.
- `src/index-sources.js`: validated Eurostat and Statistics Finland series decoders.
- `scripts/fetch-indices.mjs`, `scripts/fetch-statfin.mjs`: public-data snapshot ingestion.
- `server.mjs`: dependency-free server, private backend API and strict static-file allowlist.
- `backend/`: persistent store, Agents API adapter, Resend adapter, workflow, access controls and index acquisition.
- `src/backend-workspace.js`: sourced supplier leads, reviewed RFQs, persistent outbox and material-index interface.
- `tests/model.test.js`: data, calculation and persistence checks.

The concept documents remain separate from the implementation.
