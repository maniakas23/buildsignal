# WAVE1_SOURCE_DRIFT_AUDIT.md — Phase 1 Source/Deployment Drift Gate

**Phase:** 1 — Source & Deployment Drift Audit
**Status:** PASS
**Date:** 2026-08-21

## Method

Unified diff of candidate v302-shadow (241,079 B, sha256 `04ea7c52…c588`) against byte-exact production v301 artifact (235,699 B, sha256 `9a4b0e9c…ce43`).

**Result: 48 added lines, 0 removed-context changes outside approved patch points, 0 unrelated modifications.**

## Changes vs Allowed Categories

| # | Change | Allowed category | Verdict |
|---|---|---|---|
| 1 | `WAVE1_PROVIDER_CONFIG` block (9 providers: 6 Durham, 1 SCDOT, 2 NCDOT) inserted before `providerIdMap` | Wave 1 provider configs | ALLOWED |
| 2 | `w1` lookup + `targetTable` selector (`kestovar_canonical_events_shadow` iff Wave 1 provider) | eligibility/shadow controls | ALLOWED |
| 3 | `endpoint = (w1 && w1.endpoint) || KNOWN_ENDPOINTS[providerId]` | minimal adapter plumbing | ALLOWED |
| 4 | Field-chain prefixes `(w1 && w1.titleField && attrs[w1.titleField]) ||` (title/desc/location/status/created) | normalization mappings | ALLOWED |
| 5 | `rawMetadata` column value on raw_records INSERT (geometry passthrough for Wave 1 only; null otherwise) | normalization mappings | ALLOWED |
| 6 | dedup + canonical INSERT use `${targetTable}` | shadow controls | ALLOWED |
| 7 | providerName / eventType / confidence / county / state / city config-driven for Wave 1 | normalization mappings | ALLOWED |
| 8 | Geometry centroid + bounding guard (cx∈[-90,-70], cy∈[30,40] else null) | normalization mappings (NC/SC bbox guard) | ALLOWED |

## Explicitly NOT Changed (verified absent from diff)

- Scheduler logic (`runSchedulerCron`) — untouched
- Watermark semantics (`kestovar_ingestion_watermark` upsert) — untouched
- Canonical ID generation — untouched
- Dedup logic structure — untouched (only target table templated)
- Queue (`provider_due_queue`) — untouched
- API routes, billing, Stripe, auth, UI, Kestovar intelligence route — untouched
- Existing provider endpoints / providerIdMap — untouched
- Cron trigger, compatibility_date, bindings — untouched (deploy metadata preserves them)

## Charlotte / Cary drift check

Neither appears anywhere in the candidate. Confirmed GATED.

## Verdict

**DRIFT GATE: PASS.** All changes fall within the approved categories; no STOP condition triggered.
