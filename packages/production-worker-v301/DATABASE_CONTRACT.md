# BUILDSIGNAL V301 DATABASE CONTRACT (Phase 8)

**Date:** 2026-08-21 · Read-only reconciliation vs live D1 `a8ecb143-6aa6-4741-b4e8-fe3e16695452`. No migrations performed or proposed.

## 1. Tables touched by v301 — all present in D1 ✅

**Core ingestion contract (owned by the scheduler/engine):**

| Table | v301 usage | Notes |
|---|---|---|
| `provider_registry` | R/W | endpoint fallback, health, recordsIngested, metadata watermark (legacy) |
| `provider_polling_schedule` | R/W | due-scan, lifecycle states, backoff |
| `ingestion_runs` | W, R (status API) | 170 runs at audit; `ingestion_runs_bak_20260814` untouched |
| `kestovar_ingestion_watermark` | R/W upsert | schema verified (providerId UNIQUE, lastSourceTimestamp, counters, lastIngestedAt) |
| `kestovar_canonical_events` | R/W | canonical store; customer reads filter provenance='LIVE'; 409 rows all LIVE |
| `raw_records` | R/W | staging with payload dedup |
| `circuit_breaker` | R/W | open/half-open/closed |
| `scheduler_activity_log` | W/R | decision audit |
| `provider_due_queue` | R only (status API) | vestigial — nothing in v301 writes it |

**Product tables:** users, organizations, org_members, watchlists, alerts, alert_config, alert_history, generated_alerts, reports, notifications, notification_prefs, recommendations, recommendation_outcomes, opportunities, counties, saved_areas, search_queries, search_history, subscription_events, conversion_events, onboarding_tracking, webpush_subscriptions, geographic_zones, expansion_registry, source_candidates, signalcore_patterns, signalcore_pattern_evidence, signalcore_recommendations, providers (legacy alias).

## 2. Live D1 tables NOT touched by v301

`signalcore_provider_polls` (legacy, empty), `signalcore_events`, `signalcore_processing_watermark`, `signalcore_deliveries`, `signalcore_telemetry`, `kestovar_parity_log`, `kestovar_projection_state`, `kestovar_provider_registry`, `provider_history`, `data_providers`, `ingestion_sources`, `historical_warehouse`, `knowledge_graph_*`, `learning_*`, `daily_briefings/briefs`, `webhook_*`, `sso_*`, `saml_providers`, feedback/beta tables, `confidence_scores`, `opportunity_scores`, `pattern_library`, `pipeline_metrics`, `quality_metrics`, `model_health`, `map_markers`, `activity_log`, `audit_logs`, `enrichment_log`, `entity_resolution_log`, `data_validation_queue`, `historical_validations`, `deployment_chunks`, `_cf_KV`, `d1_migrations`, `*_bak_20260814`. Owned by other/older components; outside v301 contract.

## 3. Wave 1 implications

1. **Write-path ownership:** v301 is the sole writer of `kestovar_canonical_events`, `raw_records`, `kestovar_ingestion_watermark`, `ingestion_runs`, `provider_polling_schedule`, `circuit_breaker`, `scheduler_activity_log`. Wave 1 shadow ingestion must write to **separate shadow tables**.
2. **Customer-visible invariant:** all customer queries filter `provenance='LIVE'` — keeps SEED/TEST/SIM invisible.
3. **No schema migration needed** for registry-driven ArcGIS provider additions.
4. `provider_due_queue` is vestigial — do not build on it.
