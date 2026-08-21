# WAVE 1 FAILURE-SAFETY EVIDENCE — Phase 8

Date: 2026-08-21. Verdict: PASS — watermark never advances on failed/partial ingestion.
(Real production evidence, not simulation.)

## Evidence 1 — partial normalization failure did not advance watermark
Runs 177 and 185 (durham-nc-zoning-map-changes, broken placeholder build): fetch + raw
insert succeeded (50 rows each), then normalization threw on the first canonical INSERT.
Observed state afterwards:
- `kestovar_ingestion_watermark` row for the provider: **absent** (watermark UPSERT sits
  after the normalization loop inside the same try; the exception aborted before it).
- Shadow table: 0 rows (no partial canonicals).
- Run rows marked completed with error=null in v302 (silent-catch defect; fixed in v302.1+
  which now records the error message — confirmed by run 185 under v302.1:
  error = "D1_ERROR: 22 values for 23 columns").

## Evidence 2 — source-fetch failure leaves no watermark
Existing provider henrico-va-building_permits has lastPollStatus=failed (baseline) and
**no watermark row** — fetch failures never reach the watermark UPSERT.

## Evidence 3 — success advances watermark exactly once
Run 188 (first fully successful poll): watermark created with totalRecordsIngested=50.
Dedup repeats (189, 206): watermark totalRecordsIngested stayed 50 (+= recordsNormalized
of 0). Correct advancement on success, no advancement of counts on no-op cycles.

## Code path (deployed v302.2)
Fetch error → run marked failed, watermark untouched. Normalization error → caught,
recorded to ingestion_runs.error/errorDetails (v302.1+ observability), watermark UPSERT
skipped because it is inside the aborted try block. No path advances watermark on
failed or partial ingestion.
