# BuildSignal Platform Boundaries

**Version:** 1.0.0  
**Date:** 2026-08-07  
**Status:** Active  
**Scope:** Defines ownership boundaries between Kestovar, BuildSignal, and Parcel Lead Pro

---

## 1. Executive Summary

This document defines the clear ownership boundaries between the three platforms in the Kestovar ecosystem. It specifies which platform owns each service, API, database, and integration point, ensuring that maintenance, incident response, and feature development are routed to the correct team.

| Platform | Role | Status |
|----------|------|--------|
| **Kestovar** | Shared AI engine and data platform | Active development |
| **BuildSignal** | Infrastructure intelligence SaaS | Maintenance mode |
| **Parcel Lead Pro** | Land intelligence platform | Active development |

---

## 2. Service Ownership Matrix

### 2.1 Kestovar-Owned Services

| Service | Type | Description | BuildSignal Usage |
|---------|------|-------------|-----------------|
| `kestovar-engine` | Cloudflare Worker | AI inference and data processing | Service binding (`KESTOVAR`) |
| Kestovar API | REST API | External data and model access | Proxied via `/api/kestovar/*` |
| Kestovar KV | KV Namespace | Shared configuration and caching | Read-only via service binding |
| Kestovar D1 | D1 Database | Shared knowledge graph | Read-only via service binding |

**Owner:** Kestovar Engineering Team  
**Change Control:** Kestovar team has sole authority to modify, deploy, or decommission. BuildSignal may request changes via issue tracker.  
**SLA:** 99.9% uptime. BuildSignal gracefully degrades when unavailable.

### 2.2 BuildSignal-Owned Services

| Service | Type | Description | Other Platform Usage |
|---------|------|-------------|---------------------|
| `buildsignal-worker` | Cloudflare Worker | API and business logic | None (private) |
| `buildsignal-site` | Cloudflare Pages | Frontend application | None (private) |
| `buildsignal-db` | D1 Database | User, subscription, and app data | None (private) |
| `RATE_LIMIT` | KV Namespace | Rate limiting and caching | None (private) |
| Stripe integration | External API | Billing and subscriptions | None (private) |

**Owner:** BuildSignal Operations Team  
**Change Control:** Changes require CAB approval per MAINTENANCE_POLICY.md.  
**SLA:** 99.5% uptime (maintenance mode reduced SLA).

### 2.3 Parcel Lead Pro-Owned Services

| Service | Type | Description | BuildSignal Relationship |
|---------|------|-------------|------------------------|
| `parcellead-worker` | Cloudflare Worker | Land intelligence API | None (independent) |
| `parcellead-site` | Cloudflare Pages | Land intelligence frontend | None (independent) |
| County records API | External API | Public records integration | None (independent) |

**Owner:** Parcel Lead Pro Engineering Team  
**Change Control:** Independent from BuildSignal. May share Kestovar service binding in future.  
**SLA:** 99.5% uptime.

---

## 3. API Boundary Definitions

### 3.1 BuildSignal → Kestovar (Outbound)

| Endpoint | Method | Purpose | Data Flow |
|----------|--------|---------|-----------|
| `/api/kestovar/health` | GET | Health check | BuildSignal polls Kestovar |
| `/api/kestovar/ready` | GET | Readiness check | BuildSignal polls Kestovar |
| `/api/kestovar/dashboard` | GET | AI dashboard data | Kestovar → BuildSignal |
| `/api/kestovar/providers` | GET | Provider status | Kestovar → BuildSignal |
| `/api/kestovar/alerts` | GET | Active alerts | Kestovar → BuildSignal |
| `/api/kestovar/version` | GET | Engine version | Kestovar → BuildSignal |
| `/api/kestovar/recommendations` | GET | AI recommendations | Kestovar → BuildSignal |
| `/api/kestovar/events` | POST | Telemetry events | BuildSignal → Kestovar |
| `/api/kestovar/feedback` | POST | User feedback | BuildSignal → Kestovar |
| `/api/kestovar/batch` | POST | Batch events | BuildSignal → Kestovar |

**Contract:** Kestovar API contract is versioned. BuildSignal uses the v1 contract. Breaking changes require 30-day notice.

### 3.2 Kestovar → BuildSignal (Inbound)

| Endpoint | Method | Purpose | Data Flow |
|----------|--------|---------|-----------|
| `/api/kestovar/webhook` | POST | Kestovar status updates | Kestovar → BuildSignal |

**Contract:** BuildSignal webhook handler validates HMAC signature. Kestovar must include `X-Kestovar-Signature` header.

### 3.3 BuildSignal Internal APIs

| Endpoint | Owner | Description |
|----------|-------|-------------|
| `/health` | BuildSignal | Worker health check |
| `/ready` | BuildSignal | Worker readiness check |
| `/version` | BuildSignal | Build and version info |
| `/capabilities` | BuildSignal | Feature capability list |
| `/api/stripe/*` | BuildSignal | Stripe billing integration |
| `/api/auth/*` | BuildSignal | Authentication and authorization |
| `/api/organization/*` | BuildSignal | Organization management |
| `/api/analytics/*` | BuildSignal | Analytics and reporting |
| `/api/governance/*` | BuildSignal | Legal and compliance content |

---

## 4. Database Boundaries

### 4.1 BuildSignal D1 Database (`buildsignal-db`)

| Table | Owner | Description | External Access |
|-------|-------|-------------|-----------------|
| `users` | BuildSignal | User accounts and profiles | None |
| `organizations` | BuildSignal | Organization records | None |
| `subscriptions` | BuildSignal | Stripe subscription data | None |
| `analytics_events` | BuildSignal | Application analytics | None |
| `provider_status` | BuildSignal | Provider health cache | None |

### 4.2 Kestovar D1 Database

| Table | Owner | Description | BuildSignal Access |
|-------|-------|-------------|------------------|
| `knowledge_graph` | Kestovar | AI knowledge base | Read-only via service binding |
| `model_metadata` | Kestovar | Model versioning | Read-only via service binding |
| `shared_config` | Kestovar | Cross-platform config | Read-only via service binding |

**Rule:** BuildSignal never writes to Kestovar databases. All writes go through the Kestovar API.

---

## 5. Shared Infrastructure

### 5.1 Cloudflare Account

| Resource | Owner | Shared With | Notes |
|----------|-------|-------------|-------|
| Cloudflare Account | Kestovar (primary) | BuildSignal, Parcel Lead Pro | All services run under single account for billing efficiency |
| D1 Databases | Platform-specific | None | Each platform has isolated databases |
| KV Namespaces | Platform-specific | None | Each platform has isolated KV |
| R2 Buckets | Platform-specific | None | Each platform has isolated buckets |
| Queues | Platform-specific | None | Each platform has isolated queues |

### 5.2 Stripe Account

| Resource | Owner | Shared With | Notes |
|----------|-------|-------------|-------|
| Stripe Account | BuildSignal | None | BuildSignal owns billing exclusively |
| Products/Prices | BuildSignal | None | 4 canonical plans: Scout, Professional, Business, Enterprise |

---

## 6. Incident Response Boundaries

### 6.1 Kestovar Incident

| Impact | BuildSignal Response | Owner |
|--------|---------------------|-------|
| Kestovar API down | Graceful degradation — disable AI features, show cached data | Kestovar team |
| Kestovar degraded | Circuit breaker opens, queue events for retry | Kestovar team |
| Kestovar data error | Validate responses, log errors, fail safe | BuildSignal team |

### 6.2 BuildSignal Incident

| Impact | Kestovar Response | Owner |
|--------|-----------------|-------|
| BuildSignal API down | No impact on Kestovar | BuildSignal team |
| BuildSignal billing error | No impact on Kestovar | BuildSignal team |
| BuildSignal data breach | Notify Kestovar security if shared data affected | BuildSignal team |

### 6.3 Parcel Lead Pro Incident

| Impact | BuildSignal/Kestovar Response | Owner |
|--------|------------------------------|-------|
| Parcel Lead Pro down | No impact | Parcel Lead Pro team |

---

## 7. Change Control Boundaries

### 7.1 Kestovar Changes Affecting BuildSignal

| Change Type | Notice Required | BuildSignal Action |
|-------------|-----------------|-------------------|
| API breaking change | 30 days | Update client code, test integration |
| Service binding change | 14 days | Update wrangler.toml, redeploy |
| Deprecation | 90 days | Plan migration, notify users |
| New feature | None | Evaluate adoption timeline |

### 7.2 BuildSignal Changes Affecting Kestovar

| Change Type | Notice Required | Kestovar Action |
|-------------|-----------------|-----------------|
| New Kestovar endpoint usage | 7 days | Review load, approve |
| Increased event volume | 7 days | Scale ingestion |
| Schema change | 14 days | Review compatibility |

---

## 8. Security Boundaries

### 8.1 Authentication

| Platform | Auth Method | Token Type | Validity |
|----------|-------------|------------|----------|
| Kestovar | Service binding + API key | Internal (Cloudflare) | Session |
| BuildSignal | JWT + Clerk/Auth0 | External (Stripe) | 24h / Session |
| Parcel Lead Pro | Independent | Independent | Independent |

### 8.2 Data Classification

| Data Type | Location | Classification | Owner |
|-----------|----------|----------------|-------|
| User PII | BuildSignal D1 | Confidential | BuildSignal |
| Payment data | Stripe (external) | PCI-DSS | Stripe / BuildSignal |
| AI model outputs | Kestovar D1 | Proprietary | Kestovar |
| Aggregated analytics | BuildSignal D1 | Internal | BuildSignal |
| Provider data | Kestovar D1 | Partner confidential | Kestovar |

---

## 9. Communication Channels

| Purpose | Channel | Response Time |
|---------|---------|---------------|
| Kestovar API issues | Kestovar Slack #incidents | 15 minutes |
| BuildSignal incidents | BuildSignal Slack #ops | 30 minutes |
| Cross-platform coordination | Shared Slack #ecosystem | 1 hour |
| Security incidents | security@buildsignal.net | 1 hour |
| Emergency contact | Phone hotline (on-call) | 15 minutes |

---

## 10. Revision History

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-08-07 | Initial platform boundaries | Build 121 |

---

*BuildSignal Platform Boundaries*
*Version 1.0.0 — Build 121*
