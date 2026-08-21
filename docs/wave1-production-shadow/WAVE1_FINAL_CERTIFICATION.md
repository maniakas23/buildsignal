# BUILDSIGNAL — WAVE 1A/1B PRODUCTION SHADOW DEPLOYMENT — FINAL CERTIFICATION

Date: 2026-08-21. Directive: Wave 1A/1B Production Shadow Deployment & Observation Certification.

## FINAL VERDICT

# WAVE1_PRODUCTION_SHADOW_CERTIFIED_WITH_NONBLOCKING_LIMITATIONS

## Certified production state
- Worker: buildsignal-worker build **v302.2**, 241,342 bytes,
  SHA-256 `e0dcb19ae7af3769e713fa6ea9c883eb3044fa1768c16f0a23a563e27a68b3e6`,
  deployment id `b4fd36f3408845faaf230cfc120988d0`.
- Composition: v301 production artifact (byte-verified baseline) + 10 reviewed Wave 1
  patches (9-provider config, shadow-table write path, field mappings, geometry guard)
  + 1 observability patch (normalization errors recorded to ingestion_runs) + 1
  placeholder fix (pre-existing v301 defect).
- Bindings: D1 (DB) + JWT_SECRET/STRIPE_SECRET_KEY/STRIPE_WEBHOOK_SECRET intact.
  Cron `0 */6 * * *` intact. /health 200.
- Shadow inventory: 423 real government records in kestovar_canonical_events_shadow,
  all provenance=LIVE, waveTag=wave1. Customer canonical table: 409, unchanged, 0 leaks.
- 27/27 polling cycles completed successfully across all 9 providers (3 each).
- Rollback: redeploy byte-exact v301 artifact (packages/production-worker-v301/parts/);
  no source reconstruction needed. Optionally delete 9 WAVE1_SHADOW schedule rows and
  drop the shadow table. Rollback rehearsed in plan (WAVE1_ROLLBACK_PLAN.md).

## Hard-stop conditions — all clear
Customer leakage: 0 · existing providers: intact (409, all LIVE) · D1 binding: intact ·
cron: intact · canonical corruption: none · duplicate explosion: none (0 dup hashes) ·
watermark: correct on success/failure/partial · queue: N/A (none exists; stable) ·
Kestovar contract: unchanged, clean · Kestovar shadow-intel leak: none exists ·
drift: all 48 added lines + 2 later surgical changes mapped to allowed categories ·
rollback: rehearsed, artifact-verified.

## Non-blocking limitations (documented, not hidden)
1. **Pre-existing v301 defect fixed en route**: canonical INSERT had 22 placeholders for
   23 columns — normalization was silently broken for ALL providers since before this
   sprint. Fixed in v302.2 (one `?`). Existing providers will resume canonical inserts
   when they next observe new source records; this restores intended v301 behavior.
2. **Durham development-cases 23/50**: 27 records byte-identical to other Durham layers
   (multi-layer publication of the same case) — designed content-dedup.
3. **Polling window**: first 50 records per provider ingested (ArcGIS default order, no
   watermark field filter). Full backfill (Durham ~14.3k, SCDOT ~6.0k, NCDOT ~3.1k) will
   accumulate via cron; at ~0.78s/row, bulk backfill should use repeated limit-50/100
   runs rather than limit-500 single requests (~6.5 min wall-time risk).
4. **Case normalization**: SCDOT/NCDOT county values are source-case (uppercase);
   title-case mapping recommended before customer activation.
5. **shadowSince column** not populated by the write path (isolation is table-level;
   cosmetic).
6. **Long-horizon drift**: multi-day cron observation not claimed; recommend a 48–72h
   re-inspection of ingestion_runs + shadow counts.
7. Silent-catch observability: v302.2 records normalization errors into
   ingestion_runs.error/errorDetails; consider alerting on non-null error.

## Phase 21 — Customer-activation readiness recommendation (NOT activated)
**Recommendation: NOT YET — conditionally ready.** Before flipping any Wave 1 provider to
customer-visible: (a) complete full backfill or define a first-50 launch scope;
(b) add county case-normalization for SC/NC DOT sources; (c) run one 48–72h cron
observation; (d) write the activation path as an explicit eligibility flag migration
(move rows shadow→canonical or repoint reads) with its own rollback plan; (e) Charlotte
remains gated until its egress canary passes; Cary remains out of scope.
The $99 Stripe gate, Kestovar, and Parcel Lead Pro were not touched.

## Deliverables index (16)
1. WAVE1_PRODUCTION_SHADOW_BASELINE.md (Phase 0)
2. WAVE1_SOURCE_DRIFT_AUDIT.md (Phase 1)
3. WAVE1_SHADOW_FIREWALL_TEST.md (Phase 2)
4. WAVE1_ROLLBACK_PLAN.md (Phase 3)
5. WAVE1_DURHAM_DEPLOYMENT_EVIDENCE.md (Phases 4–5, incl. incident report)
6. WAVE1_CUSTOMER_LEAKAGE_TEST.md (Phase 6)
7. WAVE1_DEDUP_EVIDENCE.md (Phase 7)
8. WAVE1_FAILURE_SAFETY_EVIDENCE.md (Phase 8)
9. WAVE1_DURHAM_VERDICT.md (Phase 9 — DURHAM_SHADOW_PASS)
10. WAVE1B_SCDOT_NCDOT_EVIDENCE.md (Phases 10–13)
11. WAVE1_EXISTING_PROVIDER_REGRESSION.md (Phase 14)
12. WAVE1_CANONICAL_INTEGRITY_AUDIT.md (Phase 15)
13. WAVE1_KESTOVAR_HANDOFF_OBSERVATION.md (Phase 16)
14. WAVE1_CORRELATION_CAPACITY_OBSERVATION.md (Phases 17–18)
15. WAVE1_OBSERVATION_WINDOW.md (Phase 19)
16. WAVE1_FINAL_CERTIFICATION.md (this document, Phases 20–22 summary;
    Charlotte/Cary detail in WAVE1_CHARLOTTE_CARY_RECONFIRMATION.md)

Charlotte and Cary remain GATED and undeployed. Kestovar, PLP, Stripe, and the $99 gate
are untouched. Wave 1A/1B remains running in approved shadow mode.
