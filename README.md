# BuildSignal

**Version:** 1.1.9  
**Build:** 119 (Production) / Build 121 (Governance Complete)  
**Status:** Maintenance Mode — Architecture Frozen  
**Live:** [buildsignal.net](https://buildsignal.net)

---

## Overview

BuildSignal is an infrastructure intelligence product built on the Kestovar shared AI platform. It provides customers with infrastructure recommendations, reports, and dashboards powered by cross-platform intelligence.

**BuildSignal is in maintenance mode.** Per the Ecosystem Directive (Build 119), primary engineering effort has shifted to Kestovar and Parcel Lead Pro. BuildSignal receives only critical bug fixes, security patches, and customer-requested improvements.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Kestovar Platform                        │
│         (Shared AI — Intelligence, Recommendations)         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        BuildSignal                          │
│  ┌─────────────┐      ┌─────────────┐      ┌────────────┐  │
│  │  Frontend   │──────▶│ API Worker  │──────▶│  Kestovar  │  │
│  │  (React)    │      │ (tRPC/D1)   │      │  Binding   │  │
│  └─────────────┘      └─────────────┘      └────────────┘  │
│                              │                               │
│                              ▼                               │
│                       ┌─────────────┐                        │
│                       │   Stripe    │                        │
│                       │  (Billing)  │                        │
│                       └─────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

| Layer | Domain | Platform | Description |
|-------|--------|----------|-------------|
| Frontend | `buildsignal.net` | Cloudflare Pages | React + Vite SPA |
| API | `api.buildsignal.net` | Cloudflare Worker | Hono + tRPC + D1 + Stripe |
| Kestovar | Service Binding | Cloudflare Worker | AI intelligence engine |

---

## Monorepo Structure

```
packages/
  frontend/          React + Vite SPA → Cloudflare Pages
  api/               Hono + tRPC backend → Cloudflare Worker
  kestovar-engine/   AI intelligence engine → Cloudflare Worker (separate service)
```

---

## Documentation

| Document | Purpose |
|----------|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Ecosystem architecture (Kestovar, BuildSignal, Parcel Lead Pro) |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Official UI/UX design language |
| [OPERATIONS_RUNBOOK.md](./OPERATIONS_RUNBOOK.md) | Incident response procedures |
| [MAINTENANCE_GUIDE.md](./MAINTENANCE_GUIDE.md) | Routine operational procedures |
| [RELEASE_PROCESS.md](./RELEASE_PROCESS.md) | Standardized release workflow |
| [RELEASE_HISTORY_INDEX.md](./RELEASE_HISTORY_INDEX.md) | Release archive and timeline |
| [CHANGELOG.md](./CHANGELOG.md) | Version history |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Contribution guidelines |
| [SECURITY.md](./SECURITY.md) | Security policy |
| [PLATFORM_BOUNDARIES.md](./PLATFORM_BOUNDARIES.md) | Service ownership and API boundaries |
| [MAINTENANCE_POLICY.md](./MAINTENANCE_POLICY.md) | Final maintenance policy and CAB process |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Deployment procedures |

---

## Current Production Certification

- [BUILDSIGNAL_BUILD119_PRODUCTION_CERTIFICATION.md](./BUILDSIGNAL_BUILD119_PRODUCTION_CERTIFICATION.md) — Build 119 / v1.1.9 (Production)
- [BUILDSIGNAL_BUILD121_PRODUCTION_GOVERNANCE.md](./BUILDSIGNAL_BUILD121_PRODUCTION_GOVERNANCE.md) — Build 121 (Governance Complete)

Historical certifications are archived in [release-history/](./release-history/).

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, shadcn/ui |
| API | Hono, tRPC, Zod |
| AI/ML | Kestovar Engine (shared platform) |
| Database | Cloudflare D1 (SQLite-compatible) |
| Caching | Cloudflare KV |
| Deployment | Cloudflare Workers + Pages |
| Testing | Vitest, Playwright |

---

## Quick Start

### Prerequisites
- Node.js 20+
- npm 10+
- Cloudflare Wrangler CLI

### Installation
```bash
git clone https://github.com/maniakas23/buildsignal.git
cd buildsignal
npm install --force --ignore-scripts
```

### Local Development
```bash
# Frontend (port 3000)
cd packages/frontend && npm run dev

# API Worker (port 8787)
cd packages/api && npx wrangler dev

# Kestovar Engine (port 8788)
cd packages/kestovar-engine && npx wrangler dev
```

---

## Testing

### Unit Tests
```bash
cd packages/api
vitest run src/tests/
```

### E2E Tests
```bash
cd packages/frontend
npx playwright install
npx playwright test
```

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) and [RELEASE_PROCESS.md](./RELEASE_PROCESS.md) for complete procedures.

Quick deploy:
```bash
npm install
npm run typecheck
npm run build
npm run deploy:api
npm run deploy:frontend
```

---

## Security

- All secrets via Cloudflare Worker Secrets (never in source)
- `.gitignore` excludes `.env`, `.env.*`, `*.pem`, `node_modules`
- See [SECURITY.md](./SECURITY.md) for full policy

---

## License

[MIT License](./LICENSE)

---

## Status

| Metric | Value |
|--------|-------|
| Architecture | Frozen (Build 119) |
| Maintenance Mode | Active (Build 121) |
| Primary Innovation | Kestovar Platform |
| Secondary Product | Parcel Lead Pro |

BuildSignal remains stable while innovation continues through Kestovar.
