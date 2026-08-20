# BUILDSIGNAL V301 INGESTION ARCHITECTURE (Phase 5)

**Authoritative for Wave 1.** Traced function-by-function from the byte-exact recovered production source (SHA-256 `9a4b0e9c…ce43`, version 301, deployed 2026-08-16T20:56:43Z, cron `0 */6 * * *`).

## 1. Entry points

```
Cron (0 */6 * * *) ──► default.scheduled(event, env, ctx) ──► runSchedulerCron(db, cronTimestamp)
HTTP POST /api/v1/ingestion/run ──► executeIngestionRun(db, providerId, limit, "manual")
HTTP POST /api/v1/scheduler/poll ──► marks schedule 'running' only (message: use /ingestion/run)
HTTP POST /api/v1/ingest/wake-county ──► LEGACY standalone Wake path (bypasses scheduler)
```

## 2. `runSchedulerCron(db, cronTimestamp)` — 6-hour scheduler loop

1. Read `provider_polling_schedule WHERE state='active' ORDER BY nextPollDueAt`.
2. Per provider:
   - Due check: skip if `nextPollDueAt > now`.
   - Circuit breaker: open → skip; open > 300s → set `half-open`.
   - Overlap guard: `lastPollStatus='running'` & elapsed < 300s → skip; else mark `timed_out` and recover.
   - Mark `lastPollStartedAt=now, lastPollStatus='running'`.
   - `executeIngestionRun(db, providerId, 50, "scheduled")`.
   - Update schedule/registry/circuit-breaker; log every decision to `scheduler_activity_log`.
3. Then alert delivery cycle (match/generate/deliver).

## 3. `executeIngestionRun(db, providerId, limit=50, triggerType)` — ingestion engine

1. **Endpoint resolution:** `KNOWN_ENDPOINTS` hardcoded → raleigh-permits (FeatureServer/0, Building_Permits_Pending), wake-county-permits (maps.wake.gov MapServer/0), mecklenburg (gis.mecknc.gov MapServer/0), fairfax (gispub1 MapServer/5); `providerIdMap` aliases; fallback `provider_registry.apiEndpoint` (Charleston completes via this path).
2. **Run tracking:** INSERT `ingestion_runs` (running, triggerType, startedAt).
3. **Fetch:** GET `{endpoint}/query?where=1=1&outFields=*&outSR=4326&f=json&resultRecordCount={limit}` — full-window pull; dedup provides idempotency.
4. **Raw layer:** contentHash (djb2-style) of `JSON.stringify(attributes)`; exact `(providerId, rawPayload)` match → touch `observedAt`; else INSERT `raw_records` (`provenance='LIVE'`, ingestionRunId).
5. **Normalization:** canonical dedup on `contentHash` OR `rawData`; else INSERT `kestovar_canonical_events` with `canonicalId=kev-${crypto.randomUUID()}`, hardcoded `eventType="building_permit"`, `providerName="Raleigh Open Data"` (known v301 simplification), `confidence=70`, `provenance='LIVE'`.
6. **Watermark:** upsert `kestovar_ingestion_watermark ON CONFLICT(providerId)` (lastSourceTimestamp, counters, lastIngestedAt).
7. **Bookkeeping:** UPDATE ingestion_runs, provider_registry, provider_polling_schedule, circuit_breaker.

## 4. Reschedule policy

| Outcome | Effect |
|---|---|
| Success | `nextPollDueAt = now + 240*60` (4h hardcoded), backoffMultiplier=1, consecutiveSuccesses++ |
| Failure | `backoffMultiplier = min(×2, 16)`; `nextPollDueAt = now + cadenceMinutes*60*backoffMultiplier`; consecutiveFailures++ |
| Circuit breaker | failures open it; open→skip; >300s → half-open probe |

## 5. Legacy parallel path

`POST /api/v1/ingest/wake-county`: self-contained Wake ingestion (date-window query, SHA-256 contentHash dedup, canonical INSERT county="Wake" confidence=85, watermark in `provider_registry.metadata` JSON). Exists in production; scheduled engine is the active pipeline.

## 6. HTTP observability surface

`/api/v1/scheduler/status|due|poll|heartbeat|staleness|activity|webpush`, `/api/v1/ingestion/run|status|raw`, `/api/v1/ingest/test-source|current-sample`, `/api/v1/ops/metrics`.

## 7. What v301 deliberately does NOT have

- No queue handoff (`INGESTION_QUEUE` absent, no `queue()` handler) — canonical writes are synchronous.
- No per-provider fetch/parse abstraction — one ArcGIS-shaped fetcher + endpoint map + registry fallback.
- No config-driven field mapping — hardcoded per code path.

## 8. Data-flow summary

```
ArcGIS REST ──► raw_records (LIVE, payload dedup) ──► kestovar_canonical_events (LIVE, contentHash/rawData dedup)
                                                       │ customer queries all filter provenance='LIVE'
provider_polling_schedule / circuit_breaker / ingestion_runs / kestovar_ingestion_watermark / scheduler_activity_log
   = operational state owned exclusively by this worker
```
