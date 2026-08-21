# WAVE1_ROLLBACK_PLAN.md — Phase 3 Rollback Preparation

**Phase:** 3 — Rollback Preparation
**Status:** READY (verified, no source reconstruction needed)
**Date:** 2026-08-21

## Trigger Conditions (any → immediate rollback)

Customer leakage of shadow events; loss/regression of existing providers; D1 binding loss; cron loss; canonical corruption; duplicate explosion; incorrect watermark advancement; queue instability; Kestovar contract failure; unexplained drift.

## Rollback Procedure (code)

1. Fetch v301 parts from GitHub: `packages/production-worker-v301/parts/` (25 parts + manifest; byte-exact reassembly previously verified: 235,699 B, sha256 `9a4b0e9c…ce43`).
2. Concatenate in order; verify SHA-256 equals manifest.
3. Multipart PUT to `/workers/scripts/buildsignal-worker` with metadata: `DB` d1 binding `a8ecb143-6aa6-4741-b4e8-fe3e16695452`, `keep_bindings: [JWT_SECRET, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET]`, `compatibility_date: 2024-01-01`.
4. Verify: new deployment id; cron `0 */6 * * *` intact; bindings intact; `/health` 200; `/api/v1/stats` events = 409 (or last-known-good count); existing providers poll normally.

**No reconstruction of old source is required** — the artifact is stored byte-exact in two independent locations (local `/mnt/agents/output/buildsignal-worker-v301-production-original.js` and GitHub parts).

## Rollback Procedure (data)

Shadow data is fully isolated, so code rollback alone restores customer-visible behavior. Optional cleanup (not required for safety):

- `DELETE FROM provider_polling_schedule WHERE scheduledFrom='WAVE1_SHADOW'` (6 Durham rows; SCDOT/NCDOT rows if added later)
- `DROP TABLE kestovar_canonical_events_shadow` (contains only shadow events; no customer surface ever reads it)
- `raw_records` rows inserted by Wave 1 providers may remain (ops-only table, `provenance='LIVE'`, read only by ops route `/api/v1/ingestion/raw`); optional delete by `providerId IN (...wave1 ids...)`.
- Watermark rows for Wave 1 providerIds in `kestovar_ingestion_watermark` may remain harmlessly (no customer surface reads them); optional delete.

## Independence Check

Rollback was rehearsed in the recovery sprint (assembly from repo parts → byte-exact hash match → deploy path verified). Candidate staging this sprint re-verified the same mechanism for v302 (25/25 parts cmp-clean, assembly hash match). **Rollback is independent of the candidate's correctness.**

## Verdict

**PHASE 3 COMPLETE — rollback READY and rehearsed.**
