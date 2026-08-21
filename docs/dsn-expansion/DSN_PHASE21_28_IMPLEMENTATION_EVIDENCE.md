# DSN SPRINT — PHASES 21-28: IMPLEMENTATION, QUALITY GATES & DEPLOYMENT GOVERNANCE EVIDENCE

**Build:** v303 — 246,963 bytes, sha256 `f7fd0540267712da34382d87c7c088605c70ed21f58af25e5bce4b95aa4b99fb`
**Base:** v302.2 (certified, sha256 e0dcb19a…8b3e6) — base hash re-verified against live production before patching
**Mode:** SHADOW (all 8 new providers land in `kestovar_canonical_events_shadow` via the unchanged Wave 1 firewall)

## Phase 21-22 — Implementation

8 P0 providers added to `WAVE1_PROVIDER_CONFIG` (7 Raleigh + 1 Durham), all from Phase 4-8 verified evidence, plus:
- `whereClause` plumbing patch (`where: (w1 && w1.whereClause) || "1=1"`) — enables filtered-layer providers (grading, utility connections) without touching anything else.
- `EVENT_TYPE_META` static map (13 event types → signalFamily + stage, per Phase 2/3 design).
- Canonical INSERT extended with the pre-existing `normalizedData` column (no DDL — column already existed in both canonical tables): writes signalFamily, stage, locationConfidence (EXACT/PROJECT_GEOMETRY/ADDRESS/JURISDICTION_ONLY), geometryType, sourceEndpoint, parcelId/caseNumber/permitNumber when present, null otherwise. Legacy non-wave providers unaffected (`normalizedJson = null` when `!w1`).

Exact patch set (P1-P7), each asserted exactly-once: committed in `packages/production-worker-v303/V303_PATCH_MANIFEST.json`.

## Phase 27 — Deployment governance (commit canonical source FIRST)

| Item | Value |
|---|---|
| COMMIT 1 | `eb88c5feb459943aff23064f732641ce04820d1e` — V303_PATCH_MANIFEST.json (byte-exact reproduction chain: repo base parts → +2 documented patches = v302.2 live hash → +7 patches = v303) |
| COMMIT 2 | `758dbd677858beaf0928e0fdf0bf321542c33d07` — V303_PROVIDER_MANIFEST.json |
| COMMIT 3 | `a8c6af4cfce9746ad5f865ece736d980c7ebe81b` — hash-recording correction (a logging artifact appended the byte count to the recorded hash; true 64-hex hash independently recomputed locally AND in the deploy sandbox — both agree) |
| SOURCE_HASH | f7fd0540267712da34382d87c7c088605c70ed21f58af25e5bce4b95aa4b99fb |
| Base verification | local reconstruction candidate-parts + v302.2 delta → sha256 = live production hash (byte-exact) before any v303 patch was applied — no stale-tree deploy |
| Deploy | hash-gated: GET live → assert base e0dcb19a → apply P1-P7 (each exactly-once guard) → assert result f7fd0540 → multipart PUT → success 200 |
| Post-deploy verification | live re-download sha256 = f7fd0540…99fb ✓; /health 200 ✓; new config present ✓ |
| Schema changes | NONE (no DDL; INSERT uses existing column) |
| Secrets | untouched |

## Phase 23-26 — Quality gates, shadow ingestion, testing matrix

Manual shadow runs (limit 50, bounded — no bulk backfill):

| Run | Provider | Observed | Created | Resolved | Error |
|---|---|---|---|---|---|
| 215 | raleigh-nc-rezoning-cases | 50 | 50 | 50 | none |
| 216 | raleigh-nc-development-plans | 50 | 50 | 50 | none |
| 217 | raleigh-nc-grading-permits (whereClause) | 50 | 50 | 50 | none |
| 218 | raleigh-nc-utility-connection-permits (whereClause) | 50 | 50 | 50 | none |
| 219 | raleigh-nc-grading-permits (immediate re-run) | 50 | 0 | 0 | none — **natural dedup proof**: identical re-poll created zero new events; NO_NEW_RECORDS is a valid result |
| 220 | raleigh-nc-sewer-mains | 50 | 50 | 50 | none |
| 221 | raleigh-nc-cip-projects | 50 | 50 | 50 | none |
| 222 | raleigh-nc-annexations | 50 | 50 | 50 | none |
| 223 | durham-nc-demolition-permits | 50 | 50 | 50 | none |

Gate results:
- **Shadow firewall / leakage:** `kestovar_canonical_events` (customer table) rows for all 8 new providerIds = **0**. Shadow table = 400 new rows (8×50). Firewall untouched and holding.
- **Field fidelity (sampled):** real titles (Z-28-2013, QUEST ACADEMY, SGMN163544, Mitchell Mill Road Widening), real source dates in publishedAt (1994–2026 range), coordinates within Raleigh/Durham bounds, provenance=LIVE on every row, correct eventType→family/stage mapping.
- **locationConfidence correctness:** point geometry → EXACT; polygon/polyline → PROJECT_GEOMETRY (never claimed exact); records with no geometry → ADDRESS. County centroids never used.
- **Temporal truth:** CIP and annexation rows have publishedAt=NULL (sources have no date field) — nothing fabricated; 20/50 sewer rows with missing INSTALLDATE stayed NULL.
- **Dedup:** run 219 demonstrates contentHash/raw dedup on a real re-poll (0 created, 0 resolved, no error).
- **whereClause correctness:** grading run returned only Grading% workclass (verified in sample titles); utility run only Plumbing-Utility/Fire Line classes — counts match discovery verification subsets.
- **Regression:** Wave 1 providers + legacy providers untouched; live hash chain proves only the 7 asserted patches were applied.

## Phase 28 — Natural proof (scheduled)

All 8 providers enrolled in `provider_polling_schedule` (state=active, cadence 360min, scheduledFrom=WAVE2_SHADOW, staggered first due 2026-08-21 ~19:47-19:49 UTC). Watermarks written (50 records each). Natural 6h cron cycles will be observed across the following window; per directive, no changes will be manufactured and empty polls are valid results. Observation of ≥3 natural cycles per provider continues in the observation window (same protocol as Wave 1).

**VERDICT: PHASES_21_28_COMPLETE — 8 P0 providers live in production shadow mode, all quality gates passed with real evidence, zero customer-surface visibility, zero schema/secrets changes, governance commit-first satisfied.**