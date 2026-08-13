# BuildSignal Production Worker v1.5.0

## Architecture Lock Sprint — Canonical Cutover Complete

This directory contains the production Cloudflare Worker source for BuildSignal v1.5.0.

## File Structure

| File | Size | Description |
|------|------|-------------|
| `buildsignal-worker-v1.5.0.part1.js` | ~59KB | Handlers, tRPC router, search, auth, billing, admin APIs |
| `buildsignal-worker-v1.5.0.part2.js` | ~13KB | Ingestion pipeline, normalization, pattern detection, stale check |
| `assemble.js` | — | Node script to concatenate parts into deployable worker |

## Reassembly

```bash
node assemble.js > buildsignal-worker-v1.5.0.js
```

## Key Changes in v1.5.0

### Phase 5: Search Migration
- All read queries migrated from `signalcore_events` → `kestovar_canonical_events`
- Search, analytics, signals, admin endpoints now read from canonical table

### Phase 6: Downstream Migration
- `kestovar-intelligence-processor` reads from `kestovar_canonical_events`
- `kestovar-expansion` reads from `kestovar_canonical_events`

### Phase 8: Stop Legacy Writes
- Removed all `signalcore_events` INSERT operations
- Normalization pipeline writes directly to `kestovar_canonical_events`
- Batch ingestion (Wake County) writes directly to `kestovar_canonical_events`
- Dedup checks now query `kestovar_canonical_events`

### Phase 9: Repository Control
- Worker source committed to repository in split parts (GitHub 100KB limit)
- Production deployment traceable to repository commits

## Deployment

```bash
# Assemble
node assemble.js > buildsignal-worker-v1.5.0.js

# Deploy to Cloudflare Workers (using wrangler or API)
# Binding: DB = D1 database a8ecb143-6aa6-4741-b4e8-fe3e16695452
```

## Post-Deployment Verification

1. Health check: `GET /health`
2. Signals: `GET /api/v1/signals` — should return canonical IDs
3. Search: `GET /api/v1/search?q=building` — should query canonical table
4. Stats: `GET /api/v1/stats` — should reflect canonical count

## Rollback

If needed, revert to the pre-cutover worker source:
- See `buildsignal-worker-recovered.js` in the recovery archive
- Re-deploy with legacy `signalcore_events` reads and writes restored
