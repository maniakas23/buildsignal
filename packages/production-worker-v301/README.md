# production-worker-v301 — RECOVERED PRODUCTION SOURCE (READ-ONLY)

Byte-exact deployed source of the production `buildsignal-worker` (Cloudflare Workers),
recovered read-only from the Cloudflare API on 2026-08-21.

- Worker version: **301** (`924bd1d8-c9f9-4562-ac4c-b142fae64319`)
- Deployment: `6c96dc88-9cae-4f2e-bac3-a7011a3166cb` (uploaded 2026-08-16T20:56:43Z)
- Cron: `0 */6 * * *` · Compat: `2024-01-01` · Bindings: DB (D1), JWT_SECRET, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
- Size: 235,691 chars · SHA-256: `9a4b0e9cca6f159af0e0a3e9a7fdadacc2ffe7cca3567e28e6ed31de5d86ce43`

## Layout

The artifact is stored as `parts/artifact.part00.js` … `parts/artifact.part24.js`
(split only to fit GitHub API content limits). Reconstruct and verify:

```
node parts/assemble.js   # writes ../buildsignal-worker-v301-production-original.js, verifies every part + global SHA-256
```

`parts/manifest.json` carries per-part and global SHA-256 checksums.

## Rules

1. **Never edit** the recovered bytes. The artifact is the raw production source.
2. **Do not deploy** from this package without explicit owner sign-off. No automatic deployment.
3. **Do not** add a wrangler.toml here targeting `buildsignal-worker` without a reviewed
   migration plan (see `BINDING_RECONCILIATION.md` §3 for the packages/api deploy footgun).
4. `packages/production-worker/` (v1.5.0, build 131) is history, NOT the deployed source.
   See `REPO_DRIFT_REPORT.md`.

## Docs

- `SOURCE_MANIFEST.md` — deployment identity, bindings (names only), recovery checksum chain
- `RECOVERY_VERIFICATION.md` — proof this is the deployed pipeline (Phase 3)
- `INGESTION_ARCHITECTURE.md` — function-level trace of the live ingestion pipeline (Phase 5)
- `REPO_DRIFT_REPORT.md` — quantified drift vs all repos (Phase 4)
- `BINDING_RECONCILIATION.md` — deployed vs repo bindings/triggers (Phase 7)
- `DATABASE_CONTRACT.md` — tables v301 owns vs the rest of D1 (Phase 8)
- `PROVIDER_ABSTRACTION_ANALYSIS.md` — Wave 1 fit verdict: COMPATIBLE_WITH_EXTENSION (Phase 6)
- `REPRODUCIBILITY_REPORT.md` — static build validation of a copy (Phase 10)
- `SOURCE_CONTROL_RESTORATION.md` — this restoration plan (Phase 9)
