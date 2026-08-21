# WAVE 1 OBSERVATION WINDOW — Phase 19

Date: 2026-08-21. Verdict: MINIMUM MET — 3 successful real production polling cycles
per provider, no fabrication.

## Cycles per provider (all real runs in production ingestion_runs)
| Provider | Successful cycles | Run IDs |
|---|---|---|
| durham-nc-zoning-map-changes | 3 | 188, 189, 206 |
| durham-nc-subdivisions | 3 | 190, 201, 208 |
| durham-nc-site-plans | 3 | 191, 202, 209 |
| durham-nc-annexations | 3 | 192, 203, 210 |
| durham-nc-development-cases | 3 | 193, 204, 211 |
| durham-nc-active-permits | 3 | 194, 205, 212 |
| scdot-programmed-projects | 3 | 195, 196, 207 |
| ncdot-stip-points | 3 | 197, 199, 213 |
| ncdot-stip-lines | 3 | 198, 200, 214 |

Cycle mix: manual ops triggers (POST /api/v1/ingestion/run — the production ops path)
plus one fully autonomous scheduled cron cycle at ~12:00 UTC (runs 178–187 under the
predecessor build; the next 18:00 UTC cron cycle will exercise all 13 active providers
under v302.2 without intervention). DB audit confirms 27/27 status=completed, error=null.

## What was observed across the window
- First cycles: real ingestion (423 shadow events created, provenance=LIVE).
- Repeat cycles: correct dedup (0 created), watermark stability, no error accumulation
  (consecutiveFailures=0, circuit_breaker untouched).
- One scheduled cron cycle observed firing automatically against WAVE1_SHADOW rows.

## What was NOT claimed
No long-horizon (multi-day) cron observation is claimed. The 6-hour cadence will continue
autonomously; if multi-day drift observation is desired, re-inspect ingestion_runs and
the shadow table after 48–72h. No cycles were fabricated; every cycle cited above exists
as a row in production ingestion_runs with matching D1 effects.
