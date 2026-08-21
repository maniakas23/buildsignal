# WAVE 1 CUSTOMER-LEAKAGE TEST — Phase 6

Date: 2026-08-21, against live production (v302.2), 423 shadow records present in D1.
Required: 0 leaked. Result: **0 leaked — PASS**.

## Surface sweep (unauthenticated, live)

| Endpoint | Query | Result |
|---|---|---|
| /api/v1/search | q=Carthage Street Industrial (shadow title) | 0 results |
| /api/v1/search | q=Long Beverage (shadow title) | 0 results |
| /api/v1/search | q=2919 Fayetteville (shadow title) | 0 results |
| /api/v1/search | q=rezoning (wave1 eventType) | 0 results |
| /api/v1/search | q=kev-6b93fd20-… (shadow canonicalId) | 0 results |
| /api/v1/search | q=Durham | only pre-existing baseline records (durham-nc-building_permits, canonical table) — no shadow IDs |
| /api/v1/signals | county=Durham / id=<shadow id> | baseline Wake data only; id param not honored as lookup, no shadow rows |
| /api/v1/opportunities | county=Durham | pre-existing opportunities only (10, unchanged) |
| /api/v1/recommendations | county=Durham | pre-existing (12, unchanged) |
| /api/v1/search/facets | — | counties: Wake/Fairfax/Charleston only; NO Durham/SCDOT/NCDOT shadow facets |
| /api/v1/stats | — | events = 409 (shadow's 423 not counted) |
| /api/v1/freshness | — | liveRecords = 409 |
| /api/v1/jurisdictions | — | no Durham jurisdiction row from shadow data |
| /api/v1/geographic/summary | — | unchanged baseline zones |
| /api/v1/monitoring | — | events.live = 409 |
| /api/v1/kestovar/intelligence | — | canonicalEvents from main table only (409-set); zero shadow IDs |
| /api/v1/providers/list | — | baseline provider registry only |

## Direct DB cross-check
`SELECT COUNT(*) FROM kestovar_canonical_events WHERE providerId IN (all 9 wave1 ids)` → **0**
(re-checked after every poll: runs 188–214).

Verdict: CUSTOMER-LEAKAGE TEST PASS — 0 of 423 shadow events visible on any
customer-facing or Kestovar-facing surface.
