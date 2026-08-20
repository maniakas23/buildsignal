# BUILDSIGNAL V301 REPO DRIFT REPORT (Phase 4)

**Date:** 2026-08-21 · Baseline: deployed v301 (`924bd1d8-…-fae64319`, SHA-256 `9a4b0e9c…ce43`, 235,691 chars) vs all known repositories. Static comparison only; neither side modified.

## 1. Verdict

**Deployed v301 is not reproducible from, or approximated by, any repository.** The SOURCE_DRIFT_BLOCKER finding is confirmed and quantified.

## 2. Candidates compared

| Candidate | Repo | Identity | Size | Similarity to v301 (difflib) |
|---|---|---|---|---|
| A | buildsignal → packages/api/src/index.ts | tRPC API v1.0.0 | 8,013 chars | **0.008** |
| B | buildsignal → packages/production-worker v1.5.0 part1+2 | v1.5.0 build 131 | 71,754 chars | **0.056** — shares only scaffold (RateLimiterDO, CORS/security helpers) |
| C | buildsignal-deploy | frontend (HEAD ca02d23d, frozen) | — | no worker source |
| D | kestovar-engine | Python audits; src/worker.mjs absent | — | no overlap |
| E | kestovar-canonical (private) | engine/, plp/, docs/ | — | no worker source |
| F | worker-temp repos, kestovar-v6-5-0 | README/PLP/static | — | no overlap |

## 3. Capability matrix

| Capability | v301 deployed | packages/api v1.0.0 | production-worker v1.5.0 |
|---|---|---|---|
| scheduled() cron handler | ✅ full | ❌ | ✅ stub |
| runSchedulerCron | ✅ | ❌ | ❌ |
| executeIngestionRun | ✅ | ❌ | ❌ (stub runIngestion) |
| provider_polling_schedule | ✅ | ❌ | ❌ |
| circuit_breaker | ✅ | ❌ | ❌ |
| kestovar_ingestion_watermark | ✅ | ❌ | ❌ |
| raw_records staging/dedup | ✅ | ❌ | ❌ |
| kestovar_canonical_events writes | ✅ | ❌ | ❌ |
| KNOWN_ENDPOINTS ArcGIS map | ✅ | ❌ | ❌ |
| tRPC batch router | ✅ | partial (different shape) | ❌ |
| Stripe full suite | ✅ | ❌ | ❌ |
| Trials/entitlements | ✅ | ❌ | ❌ |
| Alerts pipeline | ✅ | ❌ | ❌ |
| Expansion/discovery/orchestrator | ✅ | ❌ | ❌ |
| Legal pages | ✅ | ❌ | ❌ |
| RateLimiterDO + headers | ✅ | ✅ | ✅ (only shared layer) |

## 4. Route-surface drift

v301 exposes **72 exact-match routes** + dynamic `/api/v1/providers/{id}` + `/api/trpc/*`, including 15+ operational routes (`/scheduler/*`, `/ingestion/*`, `/orchestrator/*`, `/discovery/*`, `/expansion/*`, `/ops/metrics`) existing nowhere in any repo.

## 5. Internal build-tag inconsistency

The deployed bundle self-reports build 133 (`/health`), 132 (`/version`, `/ready`), "134" (`/orchestrator/status`); bundle var `buildsignal_worker_phase8_default`; dead "PHASE 3–10" handler code appended after the sourcemap comment — evidence of hand-assembled deployment, not a clean repo build. The recovered file is the only authoritative source.

## 6. Consequences

1. Wave 1 plans against the recovered artifact, not packages/production-worker.
2. Repo is two capability generations behind production.
3. Restoration imports the artifact as a new package (done: `packages/production-worker-v301/`).
