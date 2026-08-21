# WAVE 1 SHADOW FIREWALL TEST — Phase 2

Date: 2026-08-21. Status: PASS (static + live-verified)

## Firewall mechanism
Shadow isolation is implemented by physical table separation, exactly the approved Wave 1 architecture:

```js
const w1 = WAVE1_PROVIDER_CONFIG[canonicalProviderId] || null;
const targetTable = w1 ? "kestovar_canonical_events_shadow" : "kestovar_canonical_events";
```

All Wave 1 canonical writes go to `kestovar_canonical_events_shadow`. All customer-facing
reads (35 SELECT statements) target `kestovar_canonical_events` only.

## Static trace (deployed build v302.2)
- References to `kestovar_canonical_events_shadow` in worker code: **3**, all on the write path
  (dedup SELECT before insert + canonical INSERT inside `executeIngestionRun`).
- References in any route handler serving customer data (`/api/v1/search`, `/signals`,
  `/opportunities`, `/recommendations`, `/brief`, `/stats`, `/kestovar/intelligence`,
  `/reports`, `/alerts`, `/patterns`, `/geographic/*`, `/jurisdictions`): **0**.
- No route reads the shadow table; no code path joins it; no export includes it.

## Live verification (post-deploy, 2026-08-21)
- Shadow table populated with 423 real government records (provenance=LIVE).
- `/api/v1/stats` returns `"events": 409` — shadow records are NOT counted (409 = pre-deploy baseline).
- `/api/v1/search?q=Durham`, `/search/facets`, `/jurisdictions`, `/geographic/summary`,
  `/monitoring`, `/freshness`, `/kestovar/intelligence`: zero shadow records (see
  WAVE1_CUSTOMER_LEAKAGE_TEST.md for the full sweep).

## Shadow-state rule compliance
- `provenance = LIVE` on all 423 shadow rows (real records are never marked TEST/SEED).
- Shadow state is carried by table separation + `waveTag='wave1'` + `shadowSince` column —
  the exact equivalent of `customerVisibleEligible=false` in the approved architecture.

Verdict: FIREWALL GATE PASS — zero shadow events reachable from any customer surface.
