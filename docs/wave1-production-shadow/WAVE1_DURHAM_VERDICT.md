# WAVE 1A DURHAM — PHASE 9 VERDICT

## DURHAM_SHADOW_PASS

Date: 2026-08-21. All six Durham Development Stack providers deployed in shadow mode and
observed over 3 successful production polling cycles each.

| Provider | Cycles (runs) | Shadow events | EventType | Leak |
|---|---|---|---|---|
| durham-nc-zoning-map-changes | 3 (188, 189, 206) | 50 | rezoning_filed | 0 |
| durham-nc-subdivisions | 3 (190, 201, 208) | 50 | subdivision_application | 0 |
| durham-nc-site-plans | 3 (191, 202, 209) | 50 | site_plan_submitted | 0 |
| durham-nc-annexations | 3 (192, 203, 210) | 50 | annexation_filed | 0 |
| durham-nc-development-cases | 3 (193, 204, 211) | 23 | development_case | 0 |
| durham-nc-active-permits | 3 (194, 205, 212) | 50 | building_permit | 0 |

Gates passed: firewall (0 customer-surface leakage), dedup (repeat polls create 0),
failure safety (watermark correct), provenance (all LIVE), geometry guard (all coords
within NC bbox), scheduler integration (12:00 UTC cron polled all six automatically).

Notes (non-blocking):
1. development-cases 23/50: 27 source records were byte-identical to records already
   ingested from the subdivisions/site-plans layers (same case in multiple city layers) —
   designed content-dedup, verified by JOIN.
2. A pre-existing v301 placeholder defect (22 ?s for 23 columns) silently blocked ALL
   normalization in production; found via Phase 5, fixed in v302.2 (minimal plumbing).
3. Poll latency ~35–40s for 50 new records (~0.78s/row, per-row D1 writes);
   dedup-only polls ~20s. Relevant to full backfill pacing (see capacity doc).
4. `shadowSince` column left NULL by the write path (waveTag='wave1' set by default);
   cosmetic, does not affect isolation (isolation is table-level).
