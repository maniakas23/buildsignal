# BUILDSIGNAL V301 SOURCE MANIFEST

**Sprint:** BuildSignal Production Worker Source Recovery + Reconciliation
**Mode:** Source recovery / read-only production audit
**Manifest generated:** 2026-08-21 (UTC)
**Recovery status:** COMPLETE — byte-for-byte deployed module recovered and hash-verified

---

## 1. Recovered Artifact

| Field | Value |
|---|---|
| File | `buildsignal-worker-v301-production-original.js` |
| Format | Single esbuild-bundled ES module, deployed as multipart part `index.js` |
| Size | 235,691 characters (UTF-8, single module file) |
| SHA-256 | `9a4b0e9cca6f159af0e0a3e9a7fdadacc2ffe7cca3567e28e6ed31de5d86ce43` |
| Internal source label | `buildsignal_worker_phase8_default` (bundle var name); inline routes reference builds 132/133/134 — authoritative identity is version 301 / the hash above |
| Provenance | Retrieved read-only from `GET /accounts/0bf51623a65dd89e53cc67f801f1734d/workers/scripts/buildsignal-worker/builds` |
| Edit policy | NEVER EDIT. Raw recovered production artifact. |

## 2. Deployment Identity (read-only API, as of 2026-08-21)

| Field | Value |
|---|---|
| Worker name | `buildsignal-worker` |
| Account ID | `0bf51623a65dd89e53cc67f801f1734d` |
| Version number | **301** |
| Version ID | `924bd1d8-c9f9-4562-ac4c-b142fae64319` |
| Deployment ID | `6c96dc88-9cae-4f2e-bac3-a7011a3166cb` |
| Uploaded / deployed at | `2026-08-16T20:56:43.286633Z` |
| Deploy source | `api` (author `kemsoftball@icloud.com`) |
| Compatibility date | `2024-01-01` |
| Compatibility flags | `[]` (none) |
| Usage model | `standard` |
| Routes | None on this worker (gateway-fronted) |
| Cron triggers | **`0 */6 * * *`** (created 2026-08-11T01:00:47Z) |
| Handlers exported | `fetch` + `scheduled` (cron) + Durable Object class `RateLimiterDO` |

## 3. Bindings on deployed v301 (names only — NO secret values)

| Binding name | Type | Detail |
|---|---|---|
| `DB` | `d1` | D1 database `a8ecb143-6aa6-4741-b4e8-fe3e16695452` |
| `JWT_SECRET` | `secret_text` | value never retrieved |
| `STRIPE_SECRET_KEY` | `secret_text` | value never retrieved |
| `STRIPE_WEBHOOK_SECRET` | `secret_text` | value never retrieved |

**Not present:** no Queue bindings (no `INGESTION_QUEUE`), no KV, no R2, no service bindings, no `vars`. `RateLimiterDO` class is exported but no durable_objects binding is attached to the deployed version.

## 4. Checksums

| Item | SHA-256 |
|---|---|
| Full module (235,691 chars) | `9a4b0e9cca6f159af0e0a3e9a7fdadacc2ffe7cca3567e28e6ed31de5d86ce43` |
| Cloudflare module etag (version metadata) | `57e753e9644e330cf4346bd8242214418a8427483da76dd8d490002e2ee074e7` |

Recovery used 20 × 12,000-char slices, each SHA-256-verified against Cloudflare-computed hashes at fetch time; concatenation re-verified globally. The authoritative per-part checksums for the repo copy live in `parts/manifest.json`.

## 5. Recovery channel notes

- `GET /workers/scripts/{name}/content` → **10405** with this token (no script-content read). Not usable.
- `GET /workers/scripts/{name}/versions/{id}/content` → metadata JSON only via this gateway.
- `GET /workers/scripts/{name}/builds` → **works**: multipart/form-data with `index.js` part = full module; boundary random per request; content hash stable.
- If `/builds` is ever removed, the missing permission for the canonical channel is `Workers Scripts: Read` with script-content access (account token owned by `kemsoftball@icloud.com`).

## 6. Safety attestation

No deploys, no worker modifications, no D1 writes, no cron changes, no provider-registry changes, no queue changes, no secret values accessed. GET reads + SELECT-only D1 queries only.
