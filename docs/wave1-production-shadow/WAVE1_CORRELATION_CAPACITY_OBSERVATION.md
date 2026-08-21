# WAVE 1 MULTI-SOURCE CORRELATION + CAPACITY/COST — Phases 17–18

Date: 2026-08-21.

## Phase 17 — Correlation observation (no manufactured correlations)
No cross-source correlation engine exists in the deployed worker: nothing in v302.2
joins shadow rows across providers, geospatially or otherwise, and no correlation
artifacts were produced. The only observed real-world overlap is source-side duplication:
27 Durham development-cases records byte-identical to subdivisions/site-plans records
(same case published in multiple city feature layers) — handled by designed content-dedup,
documented in WAVE1_DEDUP_EVIDENCE.md. No correlations were manufactured for this
certification. When Wave 1 data eventually activates, Durham rezoning/subdivision events
and NCDOT STIP projects in Durham County will be genuinely correlatable (shared
jurisdiction + geometry), but that analysis is out of scope for shadow mode.

## Phase 18 — Capacity & cost vs ~30 calls/day estimate
Measured production latencies (build v302.2):
- New-record poll (limit 50): 33.9–39.5s total; fetch 0.26–0.41s; parse ~18.9s;
  resolve ~19.3s (~0.78s per record, dominated by per-row D1 writes).
- Dedup-only repeat poll (limit 50): 19.6–22.0s.

Source-call budget:
- Cron `0 */6 * * *` → 4 cycles/day. Scheduler polls each due active provider once per
  cycle with limit 50 → 1 ArcGIS call per provider per cycle.
- Active providers: 9 Wave 1 + 4 active legacy (wake, charleston, raleigh, fairfax)
  = 13 providers × 4 cycles = **52 ArcGIS calls/day** at steady state (vs the ~30/day
  planning estimate — same order of magnitude; ArcGIS free-tier limits not approached).
- D1: ~2 writes + ~2 reads per record → ~100 writes per 50-record new poll;
  dedup polls ~2 queries/row. Well within D1 free tier.
- Worker wall-time: 50-record polls complete in ~40s; a full backfill at limit 500
  (~0.78s/row) would exceed comfortable single-request duration (~6.5 min) — recommend
  backfilling via repeated limit-50/100 cycles or letting cron catch up gradually.
  (First-50 windows per provider are a polling-window artifact, not a data cap.)

Verdict: capacity sufficient for shadow operation; backfill pacing noted for activation.
