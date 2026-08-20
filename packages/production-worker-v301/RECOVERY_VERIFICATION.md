# BUILDSIGNAL V301 RECOVERY COMPLETENESS VERIFICATION (Phase 3)

**Date:** 2026-08-21 · Artifact SHA-256 `9a4b0e9cca6f159af0e0a3e9a7fdadacc2ffe7cca3567e28e6ed31de5d86ce43` (235,691 chars)

## 1. Identity proof — this IS the deployed source

- Recovered via `GET /accounts/0bf51623a65dd89e53cc67f801f1734d/workers/scripts/buildsignal-worker/builds` (only channel this token can read module bytes; `/scripts/.../content` = 10405).
- 20 × 12,000-char slices each SHA-256-verified against Cloudflare-computed hashes at fetch time; concatenated module re-hashed locally → exact global match.
- Metadata agrees: version 301 / `924bd1d8-…-fae64319`, deployment `6c96dc88-…-1a3166cb`, uploaded 2026-08-16T20:56:43Z, compat 2024-01-01, cron `0 */6 * * *`.

## 2. Pipeline-feature checklist (static proof over recovered bytes)

| Required feature | Present | Evidence |
|---|---|---|
| `scheduled()` handler | ✅ | `async scheduled(event, env2, ctx)` → `runSchedulerCron(db, cronTimestamp)` |
| `provider_polling_schedule` | ✅ | 17 refs; due-scan `WHERE nextPollDueAt <= ? AND state='active'`; reschedule writes |
| `ingestion_runs` | ✅ | 6 refs; INSERT at run start; status updates |
| `kestovar_ingestion_watermark` | ✅ | upsert `ON CONFLICT(providerId)`; D1 schema verified |
| ArcGIS FeatureServer/MapServer | ✅ | FeatureServer ×2 (Raleigh), MapServer ×11 (Wake/Mecklenburg/Fairfax/Charleston); `where=1=1&outFields=*&outSR=4326&f=json` |
| Watermark advancement | ✅ | watermark upsert + registry metadata watermark (legacy path) |
| Provider health | ✅ | `healthStatus`/`lastSuccessfulFetch` updates; staleness/dashboard routes |
| Retry/backoff | ✅ | `backoffMultiplier` ×2 cap 16; success `nextPollDueAt = now + 240min` |
| Dedup | ✅ | contentHash of attributes JSON; raw payload dedup; canonical dedup by contentHash OR rawData |
| Canonical writes | ✅ | `INSERT INTO kestovar_canonical_events` ×2 paths, `provenance='LIVE'` |
| `raw_records` staging | ✅ | INSERT LIVE + re-observation touch |
| Circuit breaker | ✅ | open→skip; 300s→half-open |
| `scheduler_activity_log` | ✅ | decision audit writes |
| Overlap/timeout guard | ✅ | running<300s skip; else timed_out recovery |

## 3. Explicitly ABSENT in v301 (documented, not guessed)

| Item | Result | Consequence |
|---|---|---|
| `INGESTION_QUEUE` binding | NOT PRESENT (0 refs; no queue binding deployed) | v301 never enqueues to Cloudflare Queues |
| `queue()` consumer | NOT PRESENT | no queue consumer in this worker |
| Kestovar-engine handoff | NOT PRESENT (no `KESTOVAR_*` env, no service binding) | "Kestovar" in production = D1 table family; v301 writes canonical events directly; no downstream engine |

Absence is a property of the hash-verified deployed bytes, not a recovery gap. **RECOVERY COMPLETE; no STOP condition.**

## 4. Dynamic proof vs live D1 (SELECT-only, ~epoch 1787264543)

| Live observation | Matches code |
|---|---|
| `kestovar_canonical_events`: 409 rows, 409 LIVE | canonical INSERT writes LIVE only |
| schedule: charleston/fairfax/raleigh active+completed; wake failed backoffMultiplier=2; durham/henrico/orange/greenville disabled; mecklenburg suspended/timed_out | exactly the scheduler's backoff/disable/timeout states |
| `ingestion_runs`: 170 runs, latest startedAt 1787248899 (~consistent with 6h cron) | INSERT-per-run |
| watermark schema (providerId UNIQUE, lastSourceTimestamp, counters) | matches upsert column list |

**Verdict: RECOVERY COMPLETE AND VERIFIED.**
