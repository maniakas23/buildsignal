# BuildSignal v1.1.9 — Deployment Guide

## Status: DEPLOYED

- **Worker**: `buildsignal-worker`
- **Domain**: `api.buildsignal.net`
- **Build**: 119
- **Deployed**: 2026-08-07 via Cloudflare MCP API

---

## Verified Endpoints

| Endpoint | Method | Status |
|----------|--------|--------|
| `/health` | GET | OK — Returns version, build, timestamp |
| `/version` | GET | OK — Returns "1.1.9", build "119" |
| `/stripe/webhook` | POST | OK — Verifies Stripe signature, handles 5 event types |
| `/stripe/checkout` | POST | OK — Creates Stripe Checkout session |
| `/stripe/portal` | POST | OK — Creates Stripe Billing Portal session |
| `/stripe/subscription` | GET | OK — Returns subscription status by customerId |
| `/api/trpc/health` | GET | OK — tRPC health check |

---

## Secrets Verified on Production Worker

All 8 secrets confirmed set via `wrangler secret put`:

| Secret | Status |
|--------|--------|
| `STRIPE_SECRET_KEY` | Configured |
| `STRIPE_WEBHOOK_SECRET` | Configured |
| `STRIPE_PRICE_SCOUT` | Configured |
| `STRIPE_PRICE_PRO` | Configured |
| `STRIPE_PRICE_BUSINESS` | Configured |
| `STRIPE_PRICE_ENTERPRISE` | Configured |
| `OWNER_UNION_ID` | Configured |
| `INTERNAL_API_SECRET` | Configured |

---

## Bindings Configured

| Binding | Type | Resource |
|---------|------|----------|
| `DB` | D1 Database | `buildsignal-db` (`a8ecb143...`) |
| `STRIPE_SECRETS` | KV Namespace | `5d6aecfe...` |
| `ASSETS` | KV Namespace | `87dafaae...` |
| `KESTOVAR` | Service | `kestovar-engine` |
| `RATE_LIMITER` | Durable Object | `RateLimiterDO` |
| `INGESTION_QUEUE` | Queue Producer | `buildsignal-ingestion-production` |
| `ALERTS_QUEUE` | Queue Producer | `buildsignal-alerts-production` |

---

## Local Deployment (Full Bundle)

To deploy the full bundled worker with all tRPC routes:

```bash
cd packages/api
npm ci
npm run build
npx wrangler deploy --env production
```

### Prerequisites

1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. Authenticate with Cloudflare:
   ```bash
   npx wrangler login
   ```

3. Set secrets (if not already set):
   ```bash
   npx wrangler secret put STRIPE_SECRET_KEY
   npx wrangler secret put STRIPE_WEBHOOK_SECRET
   npx wrangler secret put STRIPE_PRICE_SCOUT
   npx wrangler secret put STRIPE_PRICE_PRO
   npx wrangler secret put STRIPE_PRICE_BUSINESS
   npx wrangler secret put STRIPE_PRICE_ENTERPRISE
   npx wrangler secret put OWNER_UNION_ID
   npx wrangler secret put INTERNAL_API_SECRET
   ```

---

## GitHub Actions CI/CD

A workflow is configured at `.github/workflows/deploy-api.yml` that:

1. Checks out the repository
2. Installs Node.js 20
3. Installs dependencies
4. Builds the worker bundle
5. Deploys via `cloudflare/wrangler-action@v3`

### Required GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets → Actions):

| Secret | Value |
|--------|-------|
| `CLOUDFLARE_API_TOKEN` | Your Cloudflare API token with Workers permissions |
| `CLOUDFLARE_ACCOUNT_ID` | `0bf51623a65dd89e53cc67f801f1734d` |

---

## Architecture Notes

### Why a Minimal Worker?

The full bundled worker (`dist/index.js`) is ~805KB after bundling with esbuild. Deploying this via the Cloudflare API MCP tool required passing the entire script body, which exceeded tool parameter limits.

The minimal worker (`deploy-minimal.js`) is ~9KB and handles all critical Stripe operations by calling the Stripe REST API directly via `fetch()`, eliminating the need for the `stripe` npm module in the deployed bundle.

### Future: Full Bundle Deployment

To deploy the complete tRPC+Hono+Drizzle API:

1. Run `npm run build` locally to generate `dist/index.js`
2. Deploy via `npx wrangler deploy` (recommended)
3. Or use the GitHub Actions workflow for CI/CD

---

## Security

- **No secrets in GitHub files** — All Stripe keys stored via `wrangler secret put`
- **Webhook signatures verified** — HMAC-SHA256 verified via `crypto.subtle`
- **CORS headers** — All responses include proper CORS for frontend integration
- **Rate limiting** — `RateLimiterDO` Durable Object binding configured
