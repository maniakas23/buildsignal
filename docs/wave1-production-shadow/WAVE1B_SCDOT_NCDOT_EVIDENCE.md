# WAVE 1B — SCDOT + NCDOT SHADOW DEPLOYMENT EVIDENCE — Phases 10–13

Date: 2026-08-21. Deployed ONLY after Durham passed Phase 9. Verdict: both PASS.

## SCDOT AllProgrammedProjects (Phase 10–11)
- Schedule row inserted: scdot-programmed-projects, state=active, cadence 360,
  scheduledFrom=WAVE1_SHADOW (same shape as Durham rows).
- Cycles: 3 (runs 195, 196, 207), all completed, error=null.
- First poll: 50 observed / 50 created / 50 normalized. Repeats: 0/0 (dedup PASS).
- Sample records: "I-85 Widening from near SC 153 (Exit 40) to near SC 85 (Exit 69)"
  (GREENVILLE), "Allendale CTC state resurfacing" (ALLENDALE) — eventType
  programmed_highway_project, state=SC, provenance=LIVE, confidence 75, real geometry
  within guard bbox.
- Priority counties observed in the FIRST 50 rows alone: YORK (2), LANCASTER (1),
  GREENVILLE (1), SPARTANBURG (1), RICHLAND (1), LEXINGTON (3) — all six SC priority
  counties present; CHARLESTON expected deeper in the full ~6,044-record set.
- Customer leakage: 0 (canonical table still 409).

## NCDOT STIP (Phases 12–13)
- Schedule rows: ncdot-stip-points (MapServer/0), ncdot-stip-lines (MapServer/1),
  active, WAVE1_SHADOW.
- Cycles: 3 each — points (197, 199, 213), lines (198, 200, 214), all completed.
- First polls: 50/50/50 each; repeats 0/0 (dedup PASS).
- Geometry: server-side reprojection to WGS84 (outSR=4326) confirmed — all 100 records
  carry valid NC lat/lng (e.g. A-0010AB, Buncombe, 35.6146/−82.5733); bbox guard nulled
  nothing (0 out-of-range, 0 null).
- countyField "Counties" mapped (multi-county values preserved, e.g. "Graham, Swain,
  Cherokee"). NC priority counties (Mecklenburg/Wake/Durham/Cabarrus/Union/Gaston)
  expected across the full ~3,063-record set.
- Customer leakage: 0.

## Wave 1B totals
Shadow table: +150 (50 SCDOT + 100 NCDOT). All provenance=LIVE, waveTag=wave1.
No watermark anomalies; no duplicates; no canonical-table writes.

Non-blocking note: SCDOT COUNTY_NAM values are uppercase ("GREENVILLE"); the
normalization path does not title-case countyField values. Irrelevant while shadowed;
normalize casing before any future customer activation.
