# ⚠️ PRODUCTION DEPLOY HAZARD — READ BEFORE ANY DEPLOY

**DO NOT RUN `npx wrangler deploy` FROM THIS PACKAGE.**

## Why

This package historically carried `name = "buildsignal-worker"` bound to the PRODUCTION D1
database `a8ecb143-6aa6-4741-b4e8-fe3e16695452`, production crons, and the
`api.buildsignal.net` route. A plain `wrangler deploy` here would REPLACE the authoritative
production ingestion worker (v301) and rewire production bindings.

## Authoritative production source

The deployed production worker (v301, deployment `6c96dc88-9cae-4f2e-bac3-a7011a3166cb`) is
recovered byte-for-byte in `packages/production-worker-v301/` (235,699 bytes, SHA-256
`9a4b0e9cca6f159af0e0a3e9a7fdadacc2ffe7cca3567e28e6ed31de5d86ce43`). Production is FROZEN.
Any future production redeploy is a deliberate owner decision, restored only from
`packages/production-worker-v301/` via the verified assembly (`parts/assemble.js`), never from
this package.

## Isolation applied (2026-08-21, Wave 1 shadow sprint Phase 0)

- Top-level worker name changed to `buildsignal-worker-dev-sandbox` so a bare deploy cannot
  collide with the production worker name.
- Top-level D1 binding now points at the PREVIEW database
  (`72478144-cbf1-466c-b1ed-82c666cc5f38`), not production.
- Top-level production route and production cron triggers removed from this file's default env
  (they live only on the deployed v301, managed outside this repo's deploy path).
- Preview env (`--env preview`) is unchanged and remains the only intended deploy target.

## Rules

1. Local/staging work targets preview resources only.
2. Never copy the production D1 id, production worker name, production routes, or production
   crons into any wrangler config in this repo.
3. No automatic deployment is enabled for this repo. Keep it that way.
