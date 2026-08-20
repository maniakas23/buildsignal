# BUILDSIGNAL V301 PROVIDER ABSTRACTION ANALYSIS (Phase 6)

**Date:** 2026-08-21 · Question: does v301 support the Wave 1 design (one ArcGISProvider + 13 configs) for Durham / SCDOT / NCDOT / Charlotte / Cary? Assessment only — no refactor authorized or performed.

## 1. What the v301 abstraction actually is

No provider class — a **de-facto single generic ArcGIS fetcher**: one URL shape `{endpoint}/query?where=1=1&outFields=*&outSR=4326&f=json&resultRecordCount=N`; resolution via `KNOWN_ENDPOINTS` → `providerIdMap` → `provider_registry.apiEndpoint` fallback. Normalization hardcoded in one loop (providerName/eventType hardcodes). I.e., already ~70% of the Wave 1 design, missing per-provider query params, field maps, and non-ArcGIS source types.

## 2. Fit per Wave 1 target

| Source | Type | v301 today | Gap |
|---|---|---|---|
| Durham | ArcGIS (stub exists; schedule disabled) | endpoint/config only | endpoint + field map; schedule re-enable is ops |
| SCDOT | ArcGIS/GeoPortal REST likely | fetch shape compatible | config + field map; maybe non-permit eventType |
| NCDOT | ArcGIS REST | fetch shape compatible | same |
| Charlotte | Socrata (`data.charlottenc.gov` in discovery code) | **not compatible with ArcGIS-only shape** | Socrata fetch branch; discovery code already anticipates `Socrata SODA API` |
| Cary | ArcGIS portal | fetch shape compatible | config + field map |

## 3. Schema/state impact

None for ArcGIS-type additions: registry carries `apiEndpoint`/`acquisitionMethod`/`recordFormat`; schedule/circuit-breaker/watermark are providerId-keyed and generic; field maps can live in `provider_registry.metadata` JSON. Socrata support needs code, not schema.

## 4. Verdict

**COMPATIBLE_WITH_EXTENSION** — move KNOWN_ENDPOINTS to config/registry, add per-provider field maps, add a Socrata branch for Charlotte-class sources. No refactor of scheduler, dedup, watermark, circuit breaker, or canonical writes needed.
