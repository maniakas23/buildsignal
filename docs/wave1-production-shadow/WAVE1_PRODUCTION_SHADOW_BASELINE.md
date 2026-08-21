# WAVE1_PRODUCTION_SHADOW_BASELINE.md — Phase 0 Baseline & Rollback Target

**Sprint:** Wave 1A/1B Production Shadow Deployment & Observation Certification
**Phase:** 0 — Production Baseline Capture
**Captured:** 2026-08-21 (pre-deployment)
**Status:** COMPLETE

## 1. Worker Code Baseline (Rollback Target)

| Item | Value |
|---|---|
| Production worker script | `buildsignal-worker` |
| Deployed version | v301 (recovered byte-exact, verified in prior sprint) |
| Size | 235,699 bytes |
| SHA-256 | `9a4b0e9cca6f159af0e0a3e9a7fdadacc2ffe7cca3567e28e6ed31de5d86ce43` |
| Authoritative artifact | `/mnt/agents/output/buildsignal-worker-v301-production-original.js` |
| Repo backup | `maniakas23/buildsignal` → `packages/production-worker-v301/parts/` (+ manifest, verified byte-exact reassembly) |
| compatibility_date | 2024-01-01 |
| Cron trigger | `0 */6 * * *` (single trigger) |

**Rollback target = redeploy this exact v301 artifact. No source reconstruction required** (verified path: download repo parts → `cat` → hash matches → multipart PUT).

## 2. Bindings (names only — values never accessed)

- `DB` → D1 database id `a8ecb143-6aa6-4741-b4e8-fe3e16695452`
- Secrets present: `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (kept via `keep_bindings` on deploy)

## 3. D1 Baseline Counts (production D1, pre-deploy)

| Table | Count / State |
|---|---|
| `kestovar_canonical_events` | 409 rows, ALL `provenance = 'LIVE'` |
| `kestovar_canonical_events_shadow` | **0 rows** (table created this phase: canonical schema + `shadowSince` + `waveTag`) |
| `ingestion_runs` | 176 rows |
| `provider_polling_schedule` | 15 rows total: 9 original + 6 new Wave 1 Durham rows |

### Schedule rows (original 9, unchanged)
- charleston — active
- fairfax — active
- raleigh — active
- wake — active (backoffMultiplier ×2)
- mecklenburg — suspended
- durham (OLD `durham-nc-building_permits`) — disabled (stays disabled; distinct from Wave 1 rows)
- henrico — disabled
- orange — disabled
- greenville — disabled

### New Wave 1 shadow schedule rows (inserted this phase)
6 rows: `durham-nc-zoning-map-changes`, `durham-nc-subdivisions`, `durham-nc-site-plans`, `durham-nc-annexations`, `durham-nc-development-cases`, `durham-nc-active-permits` — `state='active'`, `cadenceMinutes=360`, `scheduledFrom='WAVE1_SHADOW'`.

SCDOT / NCDOT schedule rows **NOT yet inserted** (gated until Durham verdict, per Phase 10–13).

## 4. API Surface Baseline

- `/health` → 200 `{"status":"ok","version":"1.6.0",...}`
- `/api/v1/stats` → events = 409 (LIVE only)
- `/api/v1/search?q=Durham` → 0 shadow-related results (none exist yet)
- Customer surfaces read ONLY `kestovar_canonical_events` (+ patterns/recommendations/opportunities tables), all filtered `provenance='LIVE'`.

## 5. Deployment Candidate (staged, verified)

| Item | Value |
|---|---|
| Candidate | v302-shadow = v301 + 17 surgical patches (48 added lines, 0 unrelated changes) |
| Size | 241,079 bytes |
| SHA-256 | `04ea7c52322a059834dd7afb5896d2a693985a92efbfc33e4c4d11f4a094c588` |
| Syntax | `node --check` PASS |
| Repo staging | `packages/production-worker-v301/candidates/parts/candidate.part00–24.js` + `manifest.json` |
| Repo reassembly check | Fresh download of all 25 parts → concat → 241,079 bytes → SHA-256 `04ea7c52…c588` **MATCH** |

## 6. Gated Sources (NOT deployed, reconfirmed)

- **Charlotte** — egress canary FAILED 0/6 (prior sprint). GATED.
- **Cary** — hub-only, 65 records. GATED.
- Both remain absent from `WAVE1_PROVIDER_CONFIG`, schedule table, and all deployment materials.

## Verdict

**PHASE 0 COMPLETE.** Rollback target byte-verified and independently recoverable from two locations (local artifact + GitHub parts). Baseline counts recorded. Safe to proceed to deployment.
