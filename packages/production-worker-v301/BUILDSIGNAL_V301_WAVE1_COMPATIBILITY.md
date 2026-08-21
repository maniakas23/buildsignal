# BUILDSIGNAL V301 — WAVE 1 UNBLOCK DECISION

Date: 2026-08-21
Basis: byte-exact recovered production source `buildsignal-worker-v301-production-original.js`
(SHA-256 `9a4b0e9cca6f159af0e0a3e9a7fdadacc2ffe7cca3567e28e6ed31de5d86ce43`, 235,699 bytes),
live read-only production state, and the Wave 1 plan (one ArcGISProvider + 13 provider configs).
This document answers the 10 mandated unblock questions. No production change was made; no
refactor is authorized by this document.

## The 10 Questions

**1. Can v301 support Durham as designed?**
PARTIAL — endpoint plumbing yes, enablement no. `durham-nc-building_permits` exists in
`provider_polling_schedule` but `state='disabled'`, and it has no entry in the v301
`KNOWN_ENDPOINTS` map. Wave 1 must add a Durham endpoint mapping (Socrata/ArcGIS per registry)
plus a config row. No engine change required if Durham is exposed as ArcGIS REST.

**2. Can v301 support SCDOT as designed?**
YES-WITH-CONFIG. SCDOT is an ArcGIS REST source family; v301's generic ArcGIS fetch
(`where=1=1&outFields=*&outSR=4326&f=json&resultRecordCount=N`) + endpoint registration +
schedule row covers it. Field mapping to the canonical contract lives in Wave 1 config, not code.

**3. Can v301 support NCDOT as designed?**
YES-WITH-CONFIG — same ArcGIS pattern as SCDOT.

**4. Can v301 support Charlotte as designed?**
REQUIRES-EXTENSION. Charlotte's open data is Socrata-first. v301's fetch path is hardcoded to
the ArcGIS `query` shape. One additional fetch branch (Socrata `$limit/$where` JSON) inside the
existing provider loop is sufficient — an extension point, not a rewrite. Everything downstream
(dedup, raw_records, canonical write, watermark) is shape-agnostic.

**5. Can v301 support Cary as designed?**
YES-WITH-CONFIG. Cary publishes ArcGIS REST services; same pattern as Raleigh/Wake.

**6. Is one provider abstraction + 13 configs viable?**
YES. The v301 run loop is already provider-generic: `executeIngestionRun(db, providerId, limit,
trigger)` resolves endpoint via KNOWN_ENDPOINTS → providerIdMap alias → provider_registry table,
then runs one uniform fetch→hash-dedup→raw→canonical→watermark pipeline. Wave 1's
"one ArcGISProvider + 13 configs" is exactly this shape, formalized. Verdict from the
abstraction analysis stands: **COMPATIBLE_WITH_EXTENSION** (extension = a second fetch adapter
for Socrata + per-provider field maps in config).

**7. What is the minimal extension needed?**
(a) endpoint/config rows for the 13 Wave 1 providers; (b) one Socrata fetch branch;
(c) per-provider field-mapping config to replace the hardcoded canonical mapping
(providerName "Raleigh Open Data", confidence 70 must become per-provider values);
(d) watermark seeding per new provider. No changes to scheduler, circuit breaker, retry/backoff,
dedup, or watermark machinery.

**8. Are schema changes required?**
NO MIGRATION REQUIRED for shadow operation. Existing tables (`provider_polling_schedule`,
`ingestion_runs`, `raw_records`, `kestovar_canonical_events`, `kestovar_ingestion_watermark`,
`provider_registry`) already carry every field the loop uses. Wave 1 shadow providers can be
added as rows. Any *new* tables Wave 1 wants (e.g., per-provider field maps as a table rather
than config) must be additive-only and are a Wave 1 decision, not a blocker.

**9. Can Wave 1 run in shadow mode without touching customer-visible queries?**
YES. Customer-visible reads query `kestovar_canonical_events` (and related LIVE tables). Shadow
mode = new providers write with their own providerIds and a shadow provenance/namespace, which
existing read paths do not select. The v301 dedup/contentHash and watermark logic is keyed by
providerId, so shadow providers cannot collide with the 409-row LIVE baseline. Alerting,
recommendations, and watchlist paths are unaffected as long as shadow rows stay out of the
LIVE-provenance read set.

**10. Can the Wave 1 sprint resume?**
YES — after the SOURCE_DRIFT_BLOCKER items are honored: (a) recovered source is now committed
to source control (`packages/production-worker-v301/`, byte-verified); (b) the
`packages/api/wrangler.toml` hazard (same worker name + same D1 id as production) must be
neutralized or guarded before ANY deploy pipeline work; (c) no deployment of v301 from the new
commit; (d) Wave 1 work proceeds as extension (Section 7), not refactor of the recovered loop.

## Decision

**WAVE1_UNBLOCKED** — conditional on the four guardrails in Q10. The recovered v301 ingestion
loop is COMPATIBLE_WITH_EXTENSION with the Wave 1 design; the only genuine gap is a Socrata
fetch branch (Charlotte) and per-provider config/field maps. Scheduler, watermark, dedup,
backoff, and canonical-write machinery require no changes.
