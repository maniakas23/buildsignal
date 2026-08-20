# BUILDSIGNAL V301 BINDING RECONCILIATION (Phase 7)

**Date:** 2026-08-21 · Secret values never included — NAMES ONLY. Deployed source: version 301 metadata (read-only). Repo source: `packages/api/wrangler.toml`.

## 1. Binding matrix

| Binding | Deployed v301 | packages/api wrangler.toml | Drift |
|---|---|---|---|
| `DB` (D1) | ✅ d1 `a8ecb143-…-e3e16695452` | ✅ same database_id | **None — same DB** |
| `JWT_SECRET` | ✅ secret_text | deployed manually | benign |
| `STRIPE_SECRET_KEY` | ✅ secret_text | secret requirement | benign |
| `STRIPE_WEBHOOK_SECRET` | ✅ secret_text | secret requirement | benign |
| `DOCUMENTS` (R2) | ❌ | ✅ | repo-only |
| `REPORTS` (R2) | ❌ | ✅ | repo-only |
| `INGESTION_QUEUE` (producer) | ❌ | ✅ | **repo-only — explains zero queue usage in v301 code** |
| `ALERTS_QUEUE` (producer) | ❌ | ✅ | repo-only |
| `STRIPE_SECRETS` (KV) | ❌ | ✅ | repo-only |
| `ASSETS` (KV) | ❌ | ✅ | repo-only |
| `RATE_LIMITER` (DO) | ❌ (class exported, not bound) | ✅ | repo-only |
| `KESTOVAR` (service → kestovar-engine) | ❌ | ✅ | **repo-only — the "Kestovar handoff" was never deployed** |
| vars (APP_NAME/NODE_ENV/KESTOVAR_API_URL/FRONTEND_URL) | ❌ | ✅ | repo-only |

## 2. Trigger/route drift

| Item | Deployed v301 | Repo wrangler.toml | Drift |
|---|---|---|---|
| Crons | `0 */6 * * *` only | `*/5 * * * *` AND `0 */6 * * *` | **repo would add a 5-minute cron** |
| Routes | none (gateway-fronted) | `api.buildsignal.net/*` custom domain | repo-only |
| Compat date | `2024-01-01`, no flags | `2026-07-16` + `nodejs_compat` | mismatch |
| Worker name | `buildsignal-worker` | `buildsignal-worker` | **SAME NAME — see §3** |

## 3. ⚠️ Critical hazard

`packages/api/wrangler.toml` targets **the same worker name and same production D1** as deployed v301. `wrangler deploy` from that package would overwrite production with the v1.0.0 tRPC API (no scheduler/ingestion), attach queue/R2/KV/DO/service bindings production never had, and add a `*/5 * * * *` cron. This is the likely origin of the source drift and remains a live footgun. Only the recovered v301 lineage may deploy to `buildsignal-worker`.

## 4. Outcome

Production is a minimal-binding worker: D1 + 3 secrets + one 6-hour cron. Everything else in repo config is aspirational and undeployed. Wave 1 must not assume queues, the KESTOVAR service binding, or R2 exist at runtime. No changes made to either side.
