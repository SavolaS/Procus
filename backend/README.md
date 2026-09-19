# Procus backend

The app now has a local, persistent sourcing backend. The same HTTP workflow drives the demo and real integrations. The fictional portfolio, negotiations and savings remain intact. No provider credentials or internet connection are required for the default demo.

## Demo

```sh
npm run dev
```

Open http://127.0.0.1:5173, choose **Agents**, then **Find demo suppliers → Prepare RFQ → Simulate RFQ email**. Review the request and confirm the displayed demo contact before simulation. Reloading or restarting retains runs and outbox records. Search **steel** in the index section to inspect real bundled historical observations.

`PROCUS_MODE=demo` uses fictional `.example` suppliers and records `simulated` dispatches. Even if API keys are already in your environment, default demo mode never invokes OpenAI or Resend. `PROCUS_INDEX_MODE=snapshot` is the default and makes no publisher calls. Mock observations are not substituted for missing real index observations.

## Configure real connections

Copy `.env.example` to `.env`, edit locally, and start with Node 20.6+:

```sh
node --env-file=.env server.mjs
```

`npm run dev` uses exported environment variables; it does not load `.env` automatically. Environment files and `.procus/` are gitignored and never served over HTTP.

| Variable | Meaning |
| --- | --- |
| `PROCUS_MODE` | `demo` (default) or `live`; separate default storage directories. |
| `PROCUS_API_TOKEN` | In live mode, a random token of at least 24 characters. Enter this workspace token in Agents; it stays only in page memory. |
| `OPENAI_API_KEY` | Server-side OpenAI application API key with Agents read/write and Responses write access. Needed for live discovery and dispatch. |
| `OPENAI_MODEL` | Agent model, default `gpt-6-astra`; use a model enabled for your project and Agents API. |
| `PROCUS_EMAIL_ENABLED` | `false` by default. `true` enables live reviewed sends only when all provider settings exist. |
| `RESEND_API_KEY` | Resend send key, server-side only. |
| `PROCUS_EMAIL_FROM` | Sender on a verified Resend domain, e.g. `Procurement <rfq@your-domain.com>`. |
| `PROCUS_INDEX_MODE` | `snapshot` or `live`. Defaults to snapshot in demo, live in live mode. Independent of supplier/email mode. |
| `PROCUS_INDEX_REFRESH_HOURS` | At least 1; defaults to 24. Live indices refresh at startup and on this interval. |
| `PROCUS_DATA_DIR` | Defaults to `.procus/demo` or `.procus/live` relative to the working directory. Use a persistent private disk. |
| `PROCUS_HOST`, `PROCUS_PORT` | Default `127.0.0.1:5173`. |

To try only real indices while keeping suppliers and email simulated, run:

```sh
PROCUS_MODE=demo PROCUS_INDEX_MODE=live npm run dev
```

Live research requires a confirmed specification. The UI also requires an explicit annual quantity because portfolio quantities are fictional. Review contact-source pages and the complete request before authorizing a live RFQ. Candidate emails are agent-extracted leads, not independently verified contacts or supplier qualifications.

## Supplier and RFQ flow

1. `POST /api/backend/runs` persists a queued run and returns HTTP 202. The application runs a bounded OpenAI Agents API session with live web search and a `record_candidates` function tool. Results must pass application validation: up to five leads with capability sources, explicit uncertainty, and a contact-page citation for every email. Missing emails remain missing. Failed research never falls back to demo suppliers.
2. The client polls `GET /api/backend/workspace`. Session IDs, requirement, timestamps, completion or failure, and candidate evidence persist locally. Internal negotiation fields, LAA, incumbent prices and targets are omitted from agent input.
3. `POST /api/backend/drafts` creates one immutable supplier-facing RFQ per run/candidate. It includes specification, indicative annual volume and quotation requirements. The deterministic template excludes internal negotiation evidence and promises no purchase commitment. Generated drafts have no arbitrary recipient/body override endpoint; revise the requirements in a new run when necessary.
4. `POST /api/backend/drafts/:id/send` requires `approved:true` and `contactConfirmed:true`. It persists approval and returns 202. In live mode a separate agent can call only `send_approved_rfq` for that exact draft ID. The server supplies the saved recipient and body to Resend. The model cannot choose another recipient or alter the message.
5. The outbox reports `simulated`, `sending`, `accepted`, `failed`, or `unknown`. **Accepted means accepted by the email provider, not delivered or replied to.** Duplicate requests cannot re-dispatch the same draft. A stable Resend idempotency key is an additional safeguard. Ambiguous sends and interrupted sends are never automatically retried; inspect the provider using the saved ID/session and attempt time before deciding how to proceed.

There are no inbound-email ingestion, delivery webhooks, attachments, automatic awards or purchase commitments in this change. Agent output and web pages cannot directly change qualification, prices or savings. Credentials are never included in agent prompts or tool output.

The adapters use the documented [Agents API session endpoint](https://developers.openai.com/api/docs/guides/agents-api/quickstart), [live web search](https://developers.openai.com/api/docs/guides/agents-api/tools/web-search), and [application-owned function tools](https://developers.openai.com/api/docs/guides/agents-api/tools/functions). The stream is successful only after root-turn completion; idle, subagent completion and disconnected streams are not success. Email uses [Resend send-email](https://resend.com/docs/api-reference/emails/send-email) and [idempotency keys](https://resend.com/docs/dashboard/emails/idempotency-keys).

## Index acquisition and relevance

The searchable catalog uses explicit material identities and official provider metadata:

| Material | Source | Scope |
| --- | --- | --- |
| Basic metals | Eurostat `sts_inppd_m`, C24, FI | Broad domestic producer-price proxy. |
| Steel | Statistics Finland `13m8`, CPA 241 | Basic iron, steel and ferro-alloys. |
| Copper | Statistics Finland `13m8`, CPA 2444 | Copper product-group proxy. |
| Aluminium | Statistics Finland `13m8`, CPA 2442 | Catalogued, but domestic observations were all missing/suppressed in the 19 September 2026 smoke check. |
| Plastics | Statistics Finland `13m8`, CPA 2016 | Plastics in primary forms. |

These are Finnish monthly producer-price indices (2021=100), **not grade-specific raw-material spot prices or EUR/kg quotes**. Material, geography, market, frequency and base-year identities are validated before ingestion. Source timestamps, periods, missing values, query, attribution and raw hashes are retained. Unknown materials return no catalog match; they do not inherit steel or basic-metals data.

Live mode queries current StatFin metadata before choosing valid months, fetches the configured material series separately so one unavailable series cannot block the others, and refreshes Eurostat independently. Immutable raw responses, metadata and parsed vintages sit beside atomically replaced latest snapshots under `indices/`. On publisher failure the last good snapshot stays available with a visible error. A bundled fallback is explicitly labelled historical rather than live. Manual and scheduled refreshes invalidate automatic portfolio pricing; the next analysis request uses the latest valid observations.

Existing BOM mappings remain steel/copper only. Finding an aluminium/plastics series does not silently create a customer BOM, choose a cost exposure, or authorize a new mapping. Raw material relevance still needs the correct grade, form, sourcing geography and contractual basis. Add reviewed provider entries/parsers and explicit BOM mappings to extend coverage.

## API

All new routes are under `/api/backend/`; JSON mutations have a 32 KB body limit. GET routes also accept HEAD. In live mode all new routes except `/config` require `Authorization: Bearer <PROCUS_API_TOKEN>`. Cross-origin mutations are rejected, no CORS is enabled, and local hosts/IP addresses are required. `/api/pricing-analysis` remains the existing public illustrative portfolio-analysis endpoint.

| Method and route | Input/result |
| --- | --- |
| `GET /config` | Public connection modes only; never keys or tokens. |
| `GET /workspace` | Runs and outbox, newest first. |
| `POST /runs` | `{productId, specification?, quantity?}` → queued run (202). |
| `POST /drafts` | `{runId, candidateId}` → immutable draft (201), idempotent per candidate/run. |
| `POST /drafts/:id/send` | `{approved:true,contactConfirmed:true}` → dispatch state (202). |
| `GET /indices?q=steel` | Catalog matches with availability, latest observation, retrieval, provenance and limitations. |
| `POST /indices/refresh` | `{}` → refresh summary; snapshot mode replays without network. |

For real imported requirements independent of the fictional portfolio, `/runs` also accepts `requirement:{id,name,category,specification,qty}`. Only those public requirement fields are projected into agent input and supplier copy; additional internal fields are ignored. This provides an ingestion boundary for a future ERP/import integration without needing real data for the demo.

## Persistence, operations and validation

The local store is a versioned JSON file with serialized transactions, synced temporary writes, atomic replacement, and a directory lock. Run **one process per data directory**. Graceful SIGINT/SIGTERM waits for work and releases the lock. After an ungraceful crash, first confirm the old process stopped, then remove only `server.lock` in that data directory and restart. Previously running research becomes `interrupted`; email that was in flight becomes `unknown`. Back up the private data directory. Do not share a directory between modes.

This is a functioning single-workspace backend for local demos and integration development. It does not yet provide tenant isolation, user accounts, a distributed queue, horizontal scaling, backups as a service or internet-facing deployment. Use localhost for real credentials; a hosted deployment needs TLS, proper identity/access management and operational storage/queue infrastructure.

`npm test` covers offline operation, persisted recovery, candidate validation, exclusion of private strategy, approval and immutable-recipient enforcement, repeated-send protection, accepted-vs-unknown outcomes, HTTP auth/origin/body controls, byte-fragmented Agents SSE, tool errors/timeouts, index identity/provenance/failures, pricing and UI semantics. Provider transports are mocked in automated tests. A read-only real index smoke test acquired July 2026 observations from Eurostat and StatFin for basic metals, steel, copper and plastics; aluminium correctly stayed unavailable. Browser smoke covered search → draft → simulated send → reload persistence and material filtering. No credentialled OpenAI/Resend calls or real emails were made during implementation.
