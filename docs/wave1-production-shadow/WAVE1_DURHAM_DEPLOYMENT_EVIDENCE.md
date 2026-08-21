# WAVE 1A DURHAM — DEPLOYMENT & FIRST-POLL EVIDENCE — Phases 4–5

Date: 2026-08-21. Account preset: 0bf51623a65dd89e53cc67f801f1734d. Worker: buildsignal-worker.

## Deployment sequence (all hash-gated; every upload verified BEFORE PUT)

| Step | Build | Bytes | SHA-256 | Deployment ID |
|---|---|---|---|---|
| Baseline (pre-existing) | v301 | 235,699 | 9a4b0e9c…ce43 | — |
| Candidate (planned) | v302-shadow | 241,079 | 04ea7c52…c588 | 8ad5945377c642c2b1963cfb4a06bcdd |
| Diagnostic (observability patch: record normalization errors to ingestion_runs.error) | v302.1 | 241,339 | cd3d680e…9929 | ec948aef5b314041993c49660302afba |
| **Final (placeholder fix)** | **v302.2** | **241,342** | **e0dcb19a…b3e6** | **b4fd36f3408845faaf230cfc120988d0** |

Deployment method: download live script → verify byte-exact expected hash → apply surgical
string patches (each anchor asserted exactly-once) → verify result hash against locally
built artifact → multipart PUT (`main_module: index.js`, compatibility_date 2024-01-01,
D1 binding DB→a8ecb143-6aa6-4741-b4e8-fe3e16695452, keep secret bindings by type).

## Incident found and fixed during Phase 5 (documented, not hidden)
First poll (run 177) created 50 raw records but normalized 0. The silent normalization
catch swallowed the error. Diagnostic build v302.1 captured it:

`D1_ERROR: 22 values for 23 columns: SQLITE_ERROR` at the canonical INSERT.

Root cause: **pre-existing v301 defect** — the canonical INSERT lists 23 columns but only
22 `?` placeholders (23 bound values). Confirmed present in the byte-exact v301 artifact;
NOT introduced by the Wave 1 patch. This bug also silently blocked normalization for ALL
existing providers (visible in hindsight: runs 175–181 all show recordsResolved=0).

Fix (v302.2): one added `?` placeholder. Same statement serves both tables; the fix
restores the originally-intended v301 behavior. Category: minimal adapter plumbing +
observability (allowed). Cleanup: 350 raw rows ingested under the broken builds (runs 177,
182–187) were deleted and re-ingested cleanly; no shadow/canonical rows were affected
(none had been created).

## Post-deploy verification (v302.2)
- Live script re-downloaded: SHA-256 == e0dcb19a…b3e6 ✓
- Bindings intact: D1 (DB), JWT_SECRET, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET ✓
- Cron trigger intact: `0 */6 * * *` ✓
- `/health` → 200, version 1.6.0 build 133, environment production ✓
- Baseline data intact: kestovar_canonical_events = 409 (all LIVE), shadow = 0 pre-poll ✓

## First successful production polls (fixed build)

| Run | Provider | Observed | Created | Normalized | Error | Latency |
|---|---|---|---|---|---|---|
| 188 | durham-nc-zoning-map-changes | 50 | 50 | 50 | none | 39.5s (fetch 261ms, parse 18.9s, resolve 19.3s) |
| 190 | durham-nc-subdivisions | 50 | 50 | 50 | none | 39.5s |
| 191 | durham-nc-site-plans | 50 | 50 | 50 | none | 38.1s |
| 192 | durham-nc-annexations | 50 | 50 | 50 | none | 39.5s |
| 193 | durham-nc-development-cases | 50 | 50 | 23 (27 legit cross-layer dups) | none | 33.9s |
| 194 | durham-nc-active-permits | 50 | 50 | 50 | none | 39.1s |

Sample normalized shadow records (real government data, provenance=LIVE, waveTag=wave1):
"Carthage Street Industrial" (rezoning_filed, Durham NC, 35.9889/-78.8569, confidence 75),
"2919 Fayetteville Street", "Long Beverage". All geometry within the NC bbox guard
(lat 30–40, lng −90…−70); 0 bad geometry rows.

Scheduler integration: the 12:00 UTC scheduled cron cycle polled all six WAVE1_SHADOW
Durham rows automatically (runs 182–187), proving cron → schedule → ingestion wiring.
