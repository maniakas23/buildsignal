# WAVE 1 REPEAT-POLL DEDUP EVIDENCE — Phase 7

Date: 2026-08-21. Verdict: PASS — zero duplicate explosion across 27 production polls.

## Repeat-poll results (identical query window, limit 50)

| Provider | First poll (created) | Repeat polls (created) | Shadow count stable |
|---|---|---|---|
| durham-nc-zoning-map-changes | 188: 50 | 189, 206: 0 / 0 | 50 ✓ |
| durham-nc-subdivisions | 190: 50 | 201, 208: 0 / 0 | 50 ✓ |
| durham-nc-site-plans | 191: 50 | 202, 209: 0 / 0 | 50 ✓ |
| durham-nc-annexations | 192: 50 | 203, 210: 0 / 0 | 50 ✓ |
| durham-nc-development-cases | 193: 50 | 204, 211: 0 / 0 | 23 ✓ |
| durham-nc-active-permits | 194: 50 | 205, 212: 0 / 0 | 50 ✓ |
| scdot-programmed-projects | 195: 50 | 196, 207: 0 / 0 | 50 ✓ |
| ncdot-stip-points | 197: 50 | 199, 213: 0 / 0 | 50 ✓ |
| ncdot-stip-lines | 198: 50 | 200, 214: 0 / 0 | 50 ✓ |

## DB-level verification after all 27 polls
- Duplicate contentHash groups in shadow table: **0**
  (`SELECT contentHash, COUNT(*) … HAVING COUNT(*)>1` → empty)
- Shadow total: 423 (= 8×50 + 23, exactly as first ingested)
- Watermark `totalRecordsIngested` unchanged on dedup polls (no double counting).

## Dedup layers exercised
1. Raw layer: providerId+rawPayload match → recordsCreated=0 on repeats.
2. Canonical layer: contentHash OR rawData match against shadow table → recordsNormalized=0.
3. Cross-layer real-world dedup observed: Durham development-cases (FS layer 20) returned
   27 payloads byte-identical to records already ingested from subdivisions/site-plans
   layers (same case present in multiple city feature layers) → correctly deduplicated,
   verified by JOIN sample (e.g. "Longebach Recombination Survey",
   "Brightleaf at the Park Tract 7 Easement"). This is the designed v301 content-dedup
   semantics, not an error.
