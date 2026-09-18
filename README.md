# Procus

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
