# BuildSignal v5.4.7

**Production-Certified Commercial Intelligence Platform**
**Build:** 108 (Sprint 3 Complete)

Infrastructure intelligence platform for construction opportunity discovery.
Live at [buildsignal.net](https://buildsignal.net)

## Architecture

BuildSignal is deployed as a Cloudflare Workers 3-stack:

| Layer | Domain | Platform | Description |
|-------|--------|----------|-------------|
| Frontend | `buildsignal.net` | Cloudflare Pages | React + Vite SPA |
| API | `api.buildsignal.net` | Cloudflare Worker | Hono + tRPC + D1 + Stripe |
| Kestovar Engine | `api.kestovar.buildsignal.net` | Cloudflare Worker | AI intelligence engine |

```
┌─────────────┐      ┌──────────────┐      ┌──────────────┐
│  Frontend   │──────▶│   API Worker │──────▶│ Kestovar     │
│  (React)    │      │  (tRPC/D1)   │      │  Engine      │
└─────────────┘      └──────────────┘      └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   Stripe     │
                     │   Live Mode  │
                     └──────────────┘
```

## Monorepo Structure

```
packages/
  frontend/          React + Vite SPA → Cloudflare Pages
  api/               Hono + tRPC backend → Cloudflare Worker
  kestovar-engine/   AI intelligence engine → Cloudflare Worker (separate service)
```

### Package: Frontend (`packages/frontend/`)

- **Tech:** React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Deploy:** Cloudflare Pages → `buildsignal.net`
- **Entry:** `src/main.tsx` → `src/App.tsx`
- **API calls:** tRPC client via `VITE_API_URL` → `api.buildsignal.net`

Key features:
- React Router SPA with protected routes
- tRPC with React Query for type-safe API calls
- Real-time monitoring dashboard (Operations Center)
- Recommendation engine UI with filtering/sorting
- Alert management with severity tiers
- Enterprise SSO login with domain discovery
- Stripe Checkout integration (live mode)

### Package: API (`packages/api/`)

- **Tech:** Hono + tRPC + Drizzle ORM + D1 + Stripe API
- **Deploy:** Cloudflare Worker → `api.buildsignal.net`
- **Entry:** `src/index.ts` (Hono fetch handler)
- **Database:** Cloudflare D1 (SQLite edge)

Key routers:
- `auth` — Kimi OAuth + Enterprise SSO (SAML 2.0)
- `billing` — Stripe product configuration (public)
- `stripe` — Checkout sessions, customer portal, webhooks
- `county` — Geographic data, intelligence scoring
- `recommendation` — AI-generated opportunity recommendations
- `alert` — Anomaly detection alerts
- `saml` — Enterprise SSO provider management
- `monitoring` — System health, Kestovar metrics
- `watchlist` — User tracking lists
- `report` — PDF report generation
- `knowledge` — Knowledge graph queries
- `pattern` — Pattern analysis endpoints
- `analytics` — Usage analytics
- `audit` — Audit logging
- `daily-ops` / `executive-ops` / `live-intelligence` — Intelligence layers

### Package: Kestovar Engine (`packages/kestovar-engine/`)

- **Tech:** Pure Cloudflare Worker (no framework)
- **Deploy:** Cloudflare Worker → `api.kestovar.buildsignal.net`
- **Entry:** `src/index.ts` (fetch handler)
- **Purpose:** AI intelligence engine consumed by API via service binding

Endpoints:
- `GET /health` — Engine health
- `GET /ready` — Readiness with subsystem checks
- `GET /version` — Engine version
- `GET /capabilities` — Feature capability negotiation
- `GET /dashboard` — Intelligence dashboard data
- `GET /providers` — Data provider status
- `GET /alerts` — Generated anomaly alerts
- `GET /recommendations/quality` — Quality metrics
- `GET /products/status` — Product health status
- `POST /events` — Single event ingestion
- `POST /events/batch` — Batch event ingestion
- `POST /recommendations/generate` — Generate recommendation
- `POST /patterns/analyze` — Pattern analysis
- `POST /correlations/analyze` — Correlation analysis
- `POST /knowledge` — Knowledge graph upsert/query
- `POST /commands` — Execute engine commands
- `POST /feedback` — Feedback ingestion

## Database Schema (D1)

### Core Tables
- `users` — Authentication (OAuth, SSO, email)
- `organizations` — Multi-tenant org isolation
- `organization_members` — Membership + roles
- `watchlists` — User tracking lists
- `watchlist_items` — Individual tracked items
- `intelligence_reports` — Generated reports
- `intelligence_alerts` — Anomaly alerts (not user watchlist)
- `recommendations` — AI-generated opportunities
- `customer_feedback` — User feedback on recommendations
- `saml_providers` — Enterprise SSO configurations
- `sso_sessions` — Active SSO sessions
- `sso_users` — SSO-mapped user accounts
- `subscription_events` — Stripe billing events
- `audit_logs` — Compliance audit trail
- `error_logs` — Error tracking
- `analytics` — Usage analytics

### Migrations
Located in `packages/api/migrations/`:
- `0001_v5.4.3_tenant_security.sql` — Tenant isolation
- `0002_stripe_billing.sql` — Stripe billing tables
- `0003_build105_routers.sql` — Core API routers
- `0004_sso_saml.sql` — Enterprise SSO tables
- `0005_recommendations_alerts_feedback.sql` — Intelligence tables

## Pricing (Live Stripe)

| Plan | Price | Interval | Features |
|------|-------|----------|----------|
| Scout | $99 | monthly | Basic monitoring, 5 counties |
| Professional | $249 | monthly | Full intelligence, 20 counties, reports |
| Business | $599 | monthly | API access, 50 counties, priority support |
| Enterprise | Custom | annual | Unlimited, SSO, dedicated support, SLA |

Stripe is configured in **live mode** with `pk_live_*` publishable key and `sk_live_*` secret key.

## Authentication

### Kimi OAuth (Default)
- OAuth 2.0 flow via `OWNER_UNION` provider
- Automatic user creation on first login
- Session management with JWT cookies

### Enterprise SSO (SAML 2.0)
- SAML 2.0 IdP integration
- SP metadata endpoint: `GET /api/saml/metadata/:providerId`
- ACS endpoint: `POST /api/saml/acs/:providerId`
- Domain-based discovery: `GET /api/saml/discover?email=...@company.com`
- Self-service provider configuration in admin panel

## Kestovar Integration

The API communicates with Kestovar Engine via **service binding** (`env.KESTOVAR.fetch()`).

If the service binding is unavailable, the API falls back to HTTP via `KESTOVAR_API_URL`.

The Kestovar client (`packages/api/src/lib/kestovar.ts`) provides:
- 13 typed methods for all engine endpoints
- Circuit breaker (5-failure threshold, 30s recovery)
- 3 retries with exponential backoff
- Metrics tracking (requests, latency, timeouts, failures)
- Request ID correlation for debugging
- Capability negotiation on startup

## Security

- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Content-Security-Policy` (strict API policy)
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` (restricts unnecessary APIs)
- Rate limiting headers: `X-RateLimit-*`
- No hardcoded credentials or `userId: 1` fallbacks
- All billing endpoints derive user ID from auth context

## Health Checks

`GET https://api.buildsignal.net/ready`

Checks: database, authentication, stripe, kestovarEngine, kestovarCapabilities, billing, analytics, reports

## Deployment

### Prerequisites
- Cloudflare account with Workers Paid plan
- Wrangler CLI authenticated: `npx wrangler login`
- D1 databases: `buildsignal-db` (production), `buildsignal-db-preview`
- Stripe account with live products configured
- Custom domains: `buildsignal.net`, `api.buildsignal.net`, `api.kestovar.buildsignal.net`

### Deploy All (Production)

```bash
npm install
npm run typecheck    # Verify both packages
npm run build        # Build frontend
npm run deploy:api   # Deploy API Worker
npm run deploy:kestovar  # Deploy Kestovar Engine
npm run deploy:frontend  # Deploy Frontend Pages
```

### Deploy Sequence
1. Apply D1 migrations to production
2. Deploy Kestovar Engine (intelligence backend)
3. Verify Kestovar Engine health: `GET /health`, `GET /ready`
4. Deploy API Worker (verifies Kestovar on startup)
5. Verify API readiness: `GET /ready` → all checks passed
6. Deploy Frontend Pages
7. Smoke test: login → dashboard → billing → logout

## Local Development

```bash
# Install dependencies
npm install

# Start frontend dev server (port 3000, proxies /api to localhost:8787)
cd packages/frontend && npm run dev

# In another terminal: start API Worker locally
cd packages/api && npx wrangler dev

# In another terminal: start Kestovar Engine locally
cd packages/kestovar-engine && npx wrangler dev
```

## Environment Variables

### Frontend (`.env.local`)
```env
VITE_API_URL=                          # Empty in dev (uses proxy), https://api.buildsignal.net in prod
VITE_SIGNALCORE_API_URL=http://localhost:8788/v1
VITE_SIGNALCORE_WS_URL=ws://localhost:8788/v1
```

### API Worker (Wrangler secrets)
```bash
npx wrangler secret put APP_ID
npx wrangler secret put APP_SECRET
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put KESTOVAR_API_KEY
npx wrangler secret put INTERNAL_API_SECRET
```

### Kestovar Engine (Wrangler secrets)
```bash
npx wrangler secret put INTERNAL_API_SECRET
```

## Testing

### Unit Tests (Kestovar Client)
```bash
cd packages/api
npx vitest run src/tests/kestovar.test.ts
```
42 tests covering: health, readiness, version, capabilities, dashboard, providers, alerts, recommendations, events, batch, patterns, correlations, knowledge graph, feedback, circuit breaker, retry logic, metrics, error classification, tenant isolation, request headers, HTTP fallback.

### E2E Tests (Playwright)
```bash
cd packages/frontend
npx playwright install
npx playwright test e2e/
```
Tests: login flow, protected routes, SSO discovery, pricing display, API health, no beta language, performance, accessibility.

## License

Private — All rights reserved.
