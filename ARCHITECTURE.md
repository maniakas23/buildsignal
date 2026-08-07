# BuildSignal Architecture

**Version:** 1.1.9  
**Build:** 119  
**Last Updated:** 2026-08-07  
**Status:** Production — Architecture Frozen

---

## Overview

BuildSignal is an infrastructure intelligence product built on the Kestovar shared AI platform. It provides customers with infrastructure recommendations, reports, and dashboards powered by cross-platform intelligence.

This document describes the architecture of the BuildSignal ecosystem, including its relationship to Kestovar and Parcel Lead Pro.

---

## Ecosystem Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Kestovar Platform                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Intelligence│  │Recommendations│  │   Knowledge Graph   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Learning  │  │   Patterns    │  │  Shared Services    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
           ┌──────────────────┼──────────────────┐
           │                  │                  │
    ┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐
    │  BuildSignal │    │ Parcel Lead │    │  Future     │
    │  (Product)   │    │    Pro      │    │  Products   │
    └──────────────┘    └──────────────┘    └──────────────┘
```

---

## Kestovar — Shared AI Platform

**Role:** Primary innovation platform and shared capability layer

### Responsibilities

| Capability | Description |
|------------|-------------|
| Intelligence | Cross-platform data analysis and inference |
| Recommendations | Personalized, context-aware recommendations |
| Learning | Continuous model improvement from feedback |
| Pattern Recognition | Detection of trends, anomalies, and opportunities |
| Knowledge Graph | Relational data model connecting entities across products |
| Shared Services | Authentication, billing, notifications, observability |

### Communication

Products communicate with Kestovar via **Cloudflare Service Bindings**:

```toml
# wrangler.toml
[[services]]
binding = "KESTOVAR"
service = "kestovar-engine"
```

The `KESTOVAR` binding exposes a typed RPC interface that BuildSignal and Parcel Lead Pro consume. All Kestovar capabilities are accessed through this binding — no direct database or API connections from products to Kestovar internals.

### Deployment

- **Worker:** `kestovar-engine`
- **Platform:** Cloudflare Workers
- **Format:** ES Module
- **D1 Database:** `kestovar-db`
- **KV Namespace:** `kestovar-kv`

---

## BuildSignal — Infrastructure Intelligence

**Role:** Customer-facing infrastructure intelligence product

### Responsibilities

| Area | Description |
|------|-------------|
| Customer Experience | Web application, dashboards, reports |
| Infrastructure Recommendations | AI-powered infrastructure insights |
| Reports | Scheduled and on-demand intelligence reports |
| Dashboards | Real-time operational dashboards |
| Data Providers | Integration with external infrastructure data sources |

### Architecture

```
┌────────────────────────────────────────┐
│           Cloudflare Pages             │
│         buildsignal-site               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │  React  │ │  Vite   │ │  SPA    │  │
│  └─────────┘ └─────────┘ └─────────┘  │
└────────────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────┐
│          Cloudflare Workers            │
│        buildsignal-worker              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │  tRPC   │ │ Stripe  │ │ Kestovar│  │
│  │ Router  │ │ Router  │ │ Client  │  │
│  └─────────┘ └─────────┘ └─────────┘  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │   D1    │ │   KV    │ │ Service │  │
│  │   DB    │ │ RATE_LIM│ │ Binding │  │
│  └─────────┘ └─────────┘ └─────────┘  │
└────────────────────────────────────────┘
```

### Components

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend | React + Vite + Tailwind CSS | Customer web application |
| API Router | tRPC + Hono | Type-safe API endpoints |
| Stripe | stripe-node SDK | Billing, subscriptions, webhooks |
| Database | Cloudflare D1 | User data, subscriptions, organizations |
| Rate Limiting | Cloudflare KV | API rate limiting |
| Kestovar Client | Typed RPC | Shared AI platform integration |

### Data Flow

1. Customer accesses BuildSignal via Cloudflare Pages (`buildsignal-site`)
2. Frontend calls API endpoints on Cloudflare Workers (`buildsignal-worker`)
3. API routes handle authentication, billing, and data queries
4. Intelligence requests are forwarded to Kestovar via service binding
5. Kestovar processes the request and returns recommendations
6. BuildSignal formats and presents results to the customer

### Deployment

- **Worker:** `buildsignal-worker`
- **Pages:** `buildsignal-site`
- **Domain:** https://buildsignal.net
- **API:** https://api.buildsignal.net

---

## Parcel Lead Pro — Land Intelligence

**Role:** Land investment intelligence product

### Responsibilities

| Area | Description |
|------|-------------|
| Parcel Scoring | AI-powered land parcel evaluation |
| Investment Opportunities | Identified growth and development areas |
| GIS | Geographic information system integration |
| Growth Analysis | Population and infrastructure growth modeling |

### Architecture

Parcel Lead Pro follows the same pattern as BuildSignal:

- Frontend: React + Vite (Cloudflare Pages)
- API: Cloudflare Workers with tRPC
- Intelligence: Kestovar service binding
- Data: Cloudflare D1 + external GIS providers

### Reuse Strategy

Parcel Lead Pro reuses as much Kestovar functionality as possible:

- Authentication (shared with BuildSignal via Kestovar)
- Billing (shared Stripe infrastructure)
- Recommendations (Kestovar recommendation engine)
- Notifications (shared notification service)
- Observability (shared monitoring and logging)

---

## Shared Platform Services

These services are implemented in Kestovar and consumed by all products:

| Service | Consumed By | Implementation |
|---------|-------------|----------------|
| Authentication | BuildSignal, Parcel Lead Pro | Kestovar auth router |
| Organizations | BuildSignal, Parcel Lead Pro | Kestovar org router |
| Billing | BuildSignal, Parcel Lead Pro | Kestovar billing + Stripe |
| Notifications | BuildSignal, Parcel Lead Pro | Kestovar notification service |
| Recommendation APIs | BuildSignal, Parcel Lead Pro | Kestovar recommendation engine |
| Event Pipeline | BuildSignal, Parcel Lead Pro | Kestovar event bus |
| Observability | BuildSignal, Parcel Lead Pro | Kestovar monitoring |
| Audit Logging | BuildSignal, Parcel Lead Pro | Kestovar audit system |
| Security | BuildSignal, Parcel Lead Pro | Kestovar security layer |

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, shadcn/ui |
| API | Hono, tRPC, Zod |
| AI/ML | Kestovar Engine (internal) |
| Database | Cloudflare D1 (SQLite-compatible) |
| Caching | Cloudflare KV |
| Deployment | Cloudflare Workers + Pages |
| CI/CD | GitHub Actions |
| Testing | Vitest, Playwright |
| Monitoring | Cloudflare Analytics |

---

## Security Model

| Layer | Protection |
|-------|-----------|
| Authentication | JWT tokens, secure cookies |
| Authorization | Role-based access control (RBAC) |
| API | Rate limiting, CORS, input validation |
| Secrets | Cloudflare Worker Secrets (never in source) |
| Data | D1 encryption at rest |
| Transport | TLS 1.3 everywhere |

---

## Long-Term Direction

- **Kestovar** becomes the primary innovation engine
- **BuildSignal** remains stable, consuming Kestovar improvements
- **Parcel Lead Pro** accelerates toward production readiness
- New capabilities are implemented in Kestovar whenever broadly reusable
- Products consume shared services rather than implementing independently

---

## References

- [MAINTENANCE_GUIDE.md](./MAINTENANCE_GUIDE.md) — Operational procedures
- [OPERATIONS_RUNBOOK.md](./OPERATIONS_RUNBOOK.md) — Incident response
- [RELEASE_PROCESS.md](./RELEASE_PROCESS.md) — Release workflow
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) — UI/UX standards
