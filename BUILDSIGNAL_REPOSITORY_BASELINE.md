# BuildSignal Repository Baseline

**Build 122 — Repository Finalization and Permanent Production Baseline**
**Date:** 2026-08-07
**Version:** 1.1.9
**Status:** BASELINE ESTABLISHED

---

## 1. Repository Structure

```
buildsignal/
├── .github/                    # CI/CD workflows
├── .gitignore                  # Git ignore rules
├── ARCHITECTURE.md             # Ecosystem architecture
├── CHANGELOG.md                # Version history
├── CONTRIBUTING.md             # Contribution guidelines
├── DEPLOYMENT.md               # Deployment configuration
├── DESIGN_SYSTEM.md            # Official design language
├── LICENSE                     # MIT License
├── MAINTENANCE_GUIDE.md        # Operational maintenance
├── MAINTENANCE_POLICY.md       # Maintenance policy + CAB
├── OPERATIONS_RUNBOOK.md       # 8 incident procedures
├── PLATFORM_BOUNDARIES.md      # Service ownership matrix
├── README.md                   # Project overview
├── REPOSITORY_HEALTH_REPORT.md # Build 122 health scan
├── RELEASE_HISTORY_INDEX.md    # Release archive timeline
├── RELEASE_PROCESS.md          # 16-gate deployment pipeline
├── SECURITY.md                 # Security policy
├── deploy.sh                   # Deployment script
├── eslint.config.js            # ESLint configuration
├── package.json                # Root package manifest
├── package-lock.json           # Dependency lockfile
├── tsconfig.json               # TypeScript configuration
├── packages/                   # Source code
│   ├── api/                    # Cloudflare Worker (backend)
│   │   ├── src/
│   │   │   ├── index.ts        # Worker entry
│   │   │   ├── router.ts       # tRPC router
│   │   │   ├── middleware.ts   # Auth + context
│   │   │   ├── db.ts           # D1 database client
│   │   │   ├── stripe.ts       # Stripe integration
│   │   │   ├── kestovar.ts     # Kestovar service binding
│   │   │   ├── providers.ts    # Provider registry
│   │   │   ├── recommendations.ts # Recommendation engine
│   │   │   ├── governance-router.ts # Governance API
│   │   │   └── ...
│   │   ├── wrangler.toml       # Worker deployment config
│   │   └── package.json
│   └── frontend/               # React SPA (Cloudflare Pages)
│       ├── src/
│       │   ├── components/     # React components
│       │   ├── pages/          # Route pages
│       │   ├── hooks/          # Custom hooks
│       │   ├── lib/            # Utilities
│       │   └── ...
│       ├── index.html
│       ├── vite.config.ts
│       └── package.json
├── release-history/            # Historical archive
│   ├── INDEX.md                # Master build index
│   ├── releases/               # Release ZIPs
│   ├── planning/               # Planning files
│   ├── deploy-logs/            # Deployment logs
│   ├── scripts/                # Archived scripts
│   └── Build111–Build121/      # Per-build archives
├── scripts/                    # Utility scripts
└── sdk/                        # SDK packages
```

---

## 2. Active Branches

| Branch | Purpose | Status |
|--------|---------|--------|
| `main` | Production | Active — protected |

**Policy:** All changes require PR review. Direct pushes to `main` are prohibited.

---

## 3. Production Version

| Field | Value |
|-------|-------|
| Current Build | 122 |
| Version | 1.1.9 |
| Semantic Version | 1.1.9+build122 |
| Status | Baseline Established |
| Last Certified | 2026-08-07 |

---

## 4. Deployment Architecture

| Component | Platform | Identifier | Status |
|-----------|----------|------------|--------|
| API Worker | Cloudflare Workers | `buildsignal-worker` | Live |
| Frontend Site | Cloudflare Pages | `buildsignal-site` | Live |
| Database | Cloudflare D1 | `buildsignal-db` (a8ecb143-6aa6-4741-b4e8-fe3e16695452) | Live |
| KV Store | Cloudflare KV | `RATE_LIMIT` (36739c55019f45b68712cd323d624c7b) | Live |
| Kestovar Binding | Service Binding | `KESTOVAR → kestovar-engine` | Live |
| Payments | Stripe | Live mode | Live |

---

## 5. Documentation Inventory

### Active Documents (Repository Root)

| Document | Purpose | Last Updated |
|----------|---------|-------------|
| `README.md` | Project overview, quick start | Build 122 |
| `ARCHITECTURE.md` | Ecosystem architecture | Build 120 |
| `DESIGN_SYSTEM.md` | Official design language | Build 120 |
| `OPERATIONS_RUNBOOK.md` | 8 incident procedures | Build 120 |
| `MAINTENANCE_GUIDE.md` | Deployments, rollbacks, secrets | Build 120 |
| `RELEASE_PROCESS.md` | 16-gate deployment pipeline | Build 120 |
| `RELEASE_HISTORY_INDEX.md` | Release archive timeline | Build 122 |
| `CHANGELOG.md` | Version history | Build 122 |
| `LICENSE` | MIT License | Build 120 |
| `CONTRIBUTING.md` | Contribution guidelines | Build 120 |
| `SECURITY.md` | Security policy | Build 120 |
| `PLATFORM_BOUNDARIES.md` | Platform ownership matrix | Build 121 |
| `MAINTENANCE_POLICY.md` | Maintenance policy + CAB | Build 121 |
| `DEPLOYMENT.md` | Deployment configuration | Build 121 |
| `REPOSITORY_HEALTH_REPORT.md` | Build 122 health scan | Build 122 |
| `BUILDSIGNAL_BUILD122_REPOSITORY_BASELINE.md` | This document | Build 122 |

### Archived Documents

All historical build certifications, evidence packages, planning files, and deployment logs are archived in `release-history/`.

See `release-history/INDEX.md` for the complete archive inventory.

---

## 6. Archive Inventory

| Archive Location | Contents |
|------------------|----------|
| `release-history/Build111/` | Build 111 certification, evidence |
| `release-history/Build113/` | Build 113 certification, PRICING_MIGRATION_AUDIT, evidence |
| `release-history/Build114/` | Build 114 certification, evidence |
| `release-history/Build115/` | Build 115 certification, evidence |
| `release-history/Build116/` | Build 116 certification, evidence |
| `release-history/Build117/` | Build 117 certification, evidence |
| `release-history/Build118/` | Build 118 certification, evidence |
| `release-history/Build119/` | Build 119 certification, evidence |
| `release-history/Build120/` | Build 120 certification, BACKLOG_Design_System_v1.0, evidence |
| `release-history/Build121/` | Build 121 certification, evidence |
| `release-history/releases/` | Release ZIPs (v1.1.5 through v1.1.9) |
| `release-history/planning/` | seed_group_5.json |
| `release-history/deploy-logs/` | Historical deployment logs |
| `release-history/scripts/` | deploy-preview.sh |

---

## 7. Governance Rules

### Permitted Changes (No CAB Required)
- Security patches and vulnerability fixes
- Performance optimizations (no architecture changes)
- Provider onboarding (new data sources)
- Monitoring and alerting improvements
- Documentation updates
- Dependency updates (patch/minor only)
- Infrastructure scaling (Cloudflare dashboard)

### Prohibited Changes (CAB Required — Exception Process)
- New features or capabilities
- Architecture changes
- Pricing or plan structure changes
- Breaking API changes
- Major dependency upgrades
- Database schema changes (beyond provider tables)
- UI/UX redesign

### Exception Process
1. Submit exception request to CAB
2. CAB reviews within 48 hours
3. If approved, create feature branch
4. Full 16-gate pipeline execution
5. CAB sign-off before merge

### CAB Membership
- BuildSignal Engineering Lead
- Kestovar Platform Lead
- Operations Lead
- Security Lead

---

## 8. Maintenance Policy

| Activity | Frequency | Owner |
|----------|-----------|-------|
| Security patch review | Weekly | Security Lead |
| Dependency update review | Monthly | Engineering Lead |
| Provider health check | Weekly | Operations |
| Documentation review | Quarterly | Engineering Lead |
| Disaster recovery test | Semi-annual | Operations |
| Penetration test | Annual | Security Lead |
| Access review | Quarterly | Security Lead |
| Compliance audit | Annual | Compliance Officer |

---

## 9. Technical Debt Registry

| # | Item | Location | Severity | Resolution Path |
|---|------|----------|----------|-----------------|
| 1 | Simulated auth token (`demo_token`) | `packages/frontend/src/hooks/useAuth.ts:42` | Low | Kestovar Platform — unified auth service |
| 2 | Backlog components not imported | `packages/frontend/src/components/*` | Info | Activate when feature exits backlog |
| 3 | shadcn/ui unused primitives | `packages/frontend/src/components/ui/*` | Info | Design system completeness — intentional |

---

## 10. Innovation Boundaries

**BuildSignal** receives new versions only for:
- Production maintenance
- Security updates
- Performance improvements
- Provider additions
- Customer-requested enhancements

**Major architectural work belongs in Kestovar.**

---

## 11. Contact & Ownership

| Role | Owner | Contact |
|------|-------|---------|
| BuildSignal Engineering | BuildSignal Team | engineering@buildsignal.net |
| Kestovar Platform | Kestovar Team | platform@kestovar.io |
| Security | Security Lead | security@buildsignal.net |
| Operations | Operations Lead | ops@buildsignal.net |

---

*BuildSignal Repository Baseline*
*Established: Build 122 (2026-08-07)*
*This document is the permanent reference for BuildSignal repository governance.*
