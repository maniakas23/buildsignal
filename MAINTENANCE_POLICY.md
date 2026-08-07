# BuildSignal Maintenance Policy

**Version:** 1.0.0  
**Date:** 2026-08-07  
**Status:** Active  
**Effective:** Immediately upon Build 121 certification  
**Authority:** Kestovar Ecosystem Directive (Build 119)

---

## 1. Executive Summary

BuildSignal entered maintenance mode effective Build 119. This document defines the precise maintenance policy — what is permitted, what is prohibited, and the approval process for exceptions. It is the single source of truth for all BuildSignal maintenance activities.

| Attribute | Value |
|-----------|-------|
| Current Version | 1.1.9 |
| Current Build | 119 (production) |
| Maintenance Build | 121 |
| Status | Frozen — maintenance mode only |
| Primary Engineering Focus | Kestovar Engine |
| Secondary Engineering Focus | Parcel Lead Pro |

---

## 2. Permitted Activities (Allowed Without Approval)

The following activities may be performed without Change Advisory Board (CAB) approval, provided they follow the documented procedures in MAINTENANCE_GUIDE.md and RELEASE_PROCESS.md.

### 2.1 Critical Security Patches

| Type | Description | Procedure |
|------|-------------|-----------|
| Dependency security updates | Patch-level updates to address CVEs | `npm audit fix`, test, deploy |
| Cloudflare security updates | Wrangler/runtime security patches | Update compatibility date, test, deploy |
| Stripe security updates | Webhook or API security fixes | Update handler, test, deploy |
| JWT/auth security updates | Token validation or session fixes | Update auth middleware, test, deploy |

**Requirement:** All security patches must be documented in the security log and reported in the next CAB meeting.

### 2.2 Provider Onboarding

| Type | Description | Procedure |
|------|-------------|-----------|
| New data provider | Adding a new construction data source | Add to config, validate schema, test ingestion |
| Provider schema update | Updating schema for existing provider | Update validator, test backward compatibility |
| Provider deprecation | Removing a discontinued data source | Update config, notify users, remove after 30 days |

**Requirement:** Provider changes must not modify application architecture or user-facing features.

### 2.3 Monitoring and Alerting

| Type | Description | Procedure |
|------|-------------|-----------|
| Dashboard updates | Updating Grafana/Datadog dashboards | No code change required |
| Alert threshold tuning | Adjusting alert sensitivity | Update threshold config, test |
| Log pipeline updates | Updating log aggregation rules | No application code change |
| Health check additions | Adding new `/health` sub-checks | Add check, test endpoint |

### 2.4 Documentation Updates

| Type | Description | Procedure |
|------|-------------|-----------|
| Operational docs | Updating runbooks, playbooks | Direct commit, no CAB required |
| API documentation | Updating OpenAPI/Swagger specs | Regenerate from code, commit |
| Legal content | Updating privacy policy, terms | Legal review, commit |
| Contact information | Updating support email, phone | Direct commit |

### 2.5 Dependency Updates

| Type | Description | Procedure |
|------|-------------|-----------|
| Patch updates | `x.x.PATCH` version bumps | `npm update`, test, deploy |
| Minor updates | `x.MINOR.x` version bumps (non-breaking) | Review changelog, test, deploy |
| Major updates | `MAJOR.x.x` version bumps | **Requires CAB approval** |

### 2.6 Infrastructure Maintenance

| Type | Description | Procedure |
|------|-------------|-----------|
| Cloudflare config | Wrangler.toml non-breaking changes | Test in preview, deploy |
| D1 maintenance | Index optimization, query tuning | Test in preview, deploy |
| KV cleanup | Removing expired keys | Safe script, dry-run first |
| R2 cleanup | Removing old report files | Safe script, dry-run first |

---

## 3. Prohibited Activities (Require CAB Approval)

The following activities are **prohibited** without explicit CAB approval. Requests must be submitted via the maintenance request form with business justification.

### 3.1 Feature Development

| Activity | Rationale |
|----------|-----------|
| New user-facing features | BuildSignal is frozen per Ecosystem Directive |
| New API endpoints | Expands surface area, requires documentation |
| New UI components | Expands frontend bundle, requires design review |
| New integrations | New third-party dependencies increase risk |
| New billing features | Stripe integration changes require audit |

### 3.2 Architectural Changes

| Activity | Rationale |
|----------|-----------|
| Database schema changes | Requires migration, rollback testing |
| Service binding changes | Affects Kestovar integration |
| Worker restructuring | Changes deployment topology |
| Frontend framework changes | Major rewrite risk |
| Authentication system changes | Security-critical, high risk |

### 3.3 Pricing Changes

| Activity | Rationale |
|----------|-----------|
| New pricing tiers | Requires Stripe product setup, legal review |
| Price changes | Requires customer communication, legal review |
| Plan feature changes | Affects all customers |
| Billing model changes | High business risk |

### 3.4 Breaking Changes

| Activity | Rationale |
|----------|-----------|
| API version deprecation | Requires migration path, customer notice |
| Response format changes | Breaks existing integrations |
| Authentication changes | Breaks existing sessions |
| URL/route changes | Breaks bookmarks, SEO |

### 3.5 Major Dependency Updates

| Activity | Rationale |
|----------|-----------|
| React major version | Requires component audit |
| TypeScript major version | Requires type fixes |
| Drizzle ORM major version | Requires migration |
| Stripe SDK major version | Requires webhook audit |
| Cloudflare Workers runtime major | Requires compatibility audit |

---

## 4. Exception Process

### 4.1 Requesting an Exception

To request approval for a prohibited activity:

1. **Submit Maintenance Request Form** (link in MAINTENANCE_GUIDE.md)
2. **Include:**
   - Activity description
   - Business justification
   - Risk assessment
   - Rollback plan
   - Testing strategy
   - Timeline
3. **CAB Review:** Weekly CAB meeting (Thursdays 10:00 AM ET)
4. **Decision:** Approved / Rejected / Deferred with conditions

### 4.2 Emergency Exception

For time-sensitive exceptions (security incidents, critical outages):

1. **Contact:** On-call engineer via PagerDuty
2. **Approval:** Single CAB member can approve emergency changes
3. **Retroactive:** Full CAB review within 48 hours
4. **Documentation:** Incident report must be filed

### 4.3 CAB Membership

| Role | Responsibility |
|------|---------------|
| CAB Chair | Kestovar Engineering Lead |
| BuildSignal Representative | BuildSignal Operations Lead |
| Security Representative | Security Officer |
| Infrastructure Representative | Cloudflare/DevOps Lead |
| Product Representative | Product Manager (observer) |

---

## 5. Maintenance Schedule

### 5.1 Regular Maintenance Windows

| Window | Day | Time (ET) | Activities |
|--------|-----|-----------|------------|
| Weekly | Tuesday | 02:00–04:00 | Dependency updates, minor patches |
| Monthly | First Sunday | 02:00–06:00 | Security patches, infrastructure cleanup |
| Quarterly | First Sunday of quarter | 02:00–08:00 | Major dependency review, architecture audit |

### 5.2 Emergency Maintenance

Emergency maintenance may be performed outside scheduled windows with:
- On-call engineer approval
- Customer notification (if user-facing impact)
- Post-incident report within 24 hours

---

## 6. Compliance and Auditing

### 6.1 Change Log

All maintenance activities must be logged:

| Field | Required |
|-------|----------|
| Date/Time | Yes |
| Engineer | Yes |
| Activity type | Yes |
| Files changed | Yes |
| CAB approval (if required) | Yes |
| Test results | Yes |
| Deployment status | Yes |
| Rollback plan | Yes |

### 6.2 Audit Trail

- All changes committed to Git with descriptive messages
- All deployments tagged with build number
- All CAB decisions recorded in `docs/cab-decisions/`
- All security patches documented in `docs/security-log/`

### 6.3 Quarterly Review

Every quarter, the CAB reviews:
- All maintenance activities since last review
- Exception frequency and patterns
- Policy effectiveness
- Recommended policy updates

---

## 7. Enforcement

### 7.1 Violations

Unauthorized prohibited activities will be:
1. **Reverted immediately** if in production
2. **Documented** in the incident log
3. **Reviewed** at the next CAB meeting
4. **Escalated** to engineering leadership if repeated

### 7.2 Appeals

Appeals of CAB decisions may be escalated to:
1. Kestovar Engineering Lead
2. CTO (final authority)

---

## 8. Related Documents

| Document | Purpose |
|----------|---------|
| `MAINTENANCE_GUIDE.md` | Detailed maintenance procedures |
| `RELEASE_PROCESS.md` | 16-gate deployment pipeline |
| `OPERATIONS_RUNBOOK.md` | Incident response procedures |
| `PLATFORM_BOUNDARIES.md` | Service ownership boundaries |
| `SECURITY.md` | Security policy and reporting |
| `CONTRIBUTING.md` | Contribution guidelines |

---

## 9. Revision History

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-08-07 | Initial maintenance policy | Build 121 |

---

*BuildSignal Maintenance Policy*
*Version 1.0.0 — Build 121*
*This policy is mandatory and enforceable for all BuildSignal maintenance activities.*
