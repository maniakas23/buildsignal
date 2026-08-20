# BUILDSIGNAL V301 SOURCE CONTROL RESTORATION PLAN (Phase 9)

**Date:** 2026-08-21 · Executed in Phase 11 as specified. No deploy; no auto-deploy enabled.

## Strategy

1. **New package, not an edit:** `packages/production-worker-v301/` in `maniakas23/buildsignal`. `packages/production-worker/` (v1.5.0) stays as history.
2. **Contents:** byte-exact artifact (stored as checksummed parts + `assemble.js` due to GitHub API content limits), README with provenance, and the reconciliation docs (manifest, verification, architecture, drift, bindings, database contract, provider analysis, reproducibility).
3. **Commit series:** `chore(production): recover authoritative buildsignal-worker v301 source` (+ follow-ups for docs/parts in the same series).
4. **Explicitly NOT done:** no deploy from the commit, no automatic deployment, no wrangler.toml targeting `buildsignal-worker` (packages/api footgun documented in BINDING_RECONCILIATION §3 stays quarantined — owner decision).
5. **Owner follow-ups:** declare this package the deploy source of record; CI guard preventing packages/api from deploying to `buildsignal-worker`; optional decompile-to-TypeScript effort for maintainable source.
