# WAVE 1 EXISTING-PROVIDER REGRESSION — Phase 14

Date: 2026-08-21. Verdict: PASS — zero loss, zero regression.

## Canonical data integrity (vs Phase 0 baseline)
| Provider | Baseline | Post-deploy | Δ |
|---|---|---|---|
| wake-county-canonical | 219 | 219 | 0 |
| wake-county-permits | 50 | 50 | 0 |
| fairfax-va-building_permits | 50 | 50 | 0 |
| charleston-sc-building_permits | 50 | 50 | 0 |
| durham-nc-building_permits | 25 | 25 | 0 |
| fairfax-va-canonical | 10 | 10 | 0 |
| charleston-sc-canonical | 5 | 5 | 0 |
| **Total** | **409** | **409** | **0** |

All 409 remain provenance=LIVE. No canonical corruption, no deletions, no dup explosion
(0 duplicate contentHash groups in main table, unchanged).

## Live polling under the new build (scheduled cron cycle, ~12:00 UTC)
| Run | Provider | Status | Observed | Created | Error |
|---|---|---|---|---|---|
| 178 | wake-county-permits | completed | 50 | 0 (dedup) | none |
| 179 | charleston-sc-building_permits | completed | 50 | 0 | none |
| 180 | raleigh-permits | completed | 50 | 0 | none |
| 181 | fairfax-va-building_permits | completed | 50 | 0 | none |

Existing providers polled normally through the new code path (w1=null → main table).
Their watermarks advanced correctly; dedup prevented re-creation.

## Schedule/config state
- 9 original schedule rows unchanged (states preserved: active/suspended/disabled as
  baseline; mecklenburg suspended, henrico/orange/greenville/durham-building disabled).
- Cron trigger `0 */6 * * *` intact. Bindings intact. /health 200.
- Wake customer surfaces (search/signals/facets/jurisdictions) verified live —
  Wake data fully served.

## Pre-existing defect disclosed
The placeholder bug fixed in v302.2 also affected existing providers (their normalization
was silently broken in v301 — visible in historical runs with recordsResolved=0). The fix
restores intended behavior; it cannot corrupt existing data (insert path was never
reaching the table). When existing providers next observe genuinely NEW source records,
canonical inserts will resume as originally designed.
