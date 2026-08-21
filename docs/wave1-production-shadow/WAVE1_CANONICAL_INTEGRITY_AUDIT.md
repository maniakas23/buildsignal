# WAVE 1 CANONICAL DATA INTEGRITY AUDIT — Phase 15

Date: 2026-08-21 (post 27 production polls, build v302.2). Verdict: PASS.

## Customer-facing canonical table (kestovar_canonical_events) — 409 rows
| Provider | Rows | Provenance |
|---|---|---|
| wake-county-canonical | 219 | LIVE |
| wake-county-permits | 50 | LIVE |
| fairfax-va-building_permits | 50 | LIVE |
| charleston-sc-building_permits | 50 | LIVE |
| durham-nc-building_permits | 25 | LIVE |
| fairfax-va-canonical | 10 | LIVE |
| charleston-sc-canonical | 5 | LIVE |

- By provenance: LIVE 409, TEST 0, SEED 0.
- Wave 1 provider IDs in canonical table: **0** (hard firewall verified at DB level).
- Duplicate contentHash groups: 0.

## Shadow table (kestovar_canonical_events_shadow) — 423 rows
| Provider | EventType | Rows | Provenance | Eligibility |
|---|---|---|---|---|
| durham-nc-zoning-map-changes | rezoning_filed | 50 | LIVE | shadow (table-separated, waveTag=wave1) |
| durham-nc-subdivisions | subdivision_application | 50 | LIVE | shadow |
| durham-nc-site-plans | site_plan_submitted | 50 | LIVE | shadow |
| durham-nc-annexations | annexation_filed | 50 | LIVE | shadow |
| durham-nc-development-cases | development_case | 23 | LIVE | shadow |
| durham-nc-active-permits | building_permit | 50 | LIVE | shadow |
| scdot-programmed-projects | programmed_highway_project | 50 | LIVE | shadow |
| ncdot-stip-points | funded_transportation_project | 50 | LIVE | shadow |
| ncdot-stip-lines | funded_transportation_project | 50 | LIVE | shadow |

- By provenance: LIVE 423, TEST 0, SEED 0 — real government records keep provenance=LIVE;
  shadow state is carried by table separation + waveTag (approved architecture equivalent
  of customerVisibleEligible=false).
- Duplicate contentHash groups: 0. Geometry: 0 rows outside lat 30–40 / lng −90…−70;
  0 null geometry.
- Jurisdictions: Durham NC (Durham stack); SC counties incl. all six SC priority counties;
  NC counties incl. Buncombe/Graham/Swain/Cherokee in first NCDOT window.

## Polling-cycle audit (ingestion_runs id ≥ 188)
9 providers × 3 cycles = 27 runs, all status=completed, error=null. No failed runs,
no partial writes, no queue anomalies (no queue exists in this architecture — per-run
synchronous D1 writes).
