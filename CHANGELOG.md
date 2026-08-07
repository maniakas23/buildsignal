# BuildSignal Changelog

All notable changes to BuildSignal are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.9] — 2026-08-07 (Build 119)

### Added
- GitHub security audit: verified private repo, no secrets in source
- Architecture freeze per Ecosystem Directive
- Transition to Kestovar ecosystem declared

### Changed
- Version bumped: 1.1.8 → 1.1.9
- Build bumped: 118 → 119
- All endpoints verified returning Build 119 / v1.1.9

### Security
- Verified `.gitignore` excludes `.env`, `.env.*`, `*.pem`, `node_modules`
- Code search for secrets returned 0 results
- Confirmed all credentials via Cloudflare Worker Secrets

---

## [1.1.8] — 2026-08-07 (Build 118)

### Added
- Production verification build
- Live endpoint verification for /health, /ready, /version, /capabilities
- Kestovar integration verified (27/27 assertions)

### Changed
- Version bumped: 1.1.7 → 1.1.8
- Build bumped: 117 → 118

---

## [1.1.7] — 2026-08-07 (Build 117)

### Added
- Production release build
- Cloudflare Workers deployment via MCP API
- Cloudflare Pages frontend deployment
- Full 16-gate pipeline execution

### Changed
- Version bumped: 1.1.6 → 1.1.7
- Build bumped: 116 → 117

---

## [1.1.6] — 2026-08-07 (Build 116)

### Added
- Post-launch stability certification
- Full deployment pipeline re-execution
- Content truth validation

### Changed
- Version bumped: 1.1.5 → 1.1.6
- Build bumped: 115 → 116

---

## [1.1.5] — 2026-08-07 (Build 115)

### Added
- Production launch build
- Canonical 4-tier pricing: Scout ($99), Professional ($249), Business ($599), Enterprise (Custom)
- Stripe Checkout + Billing Portal + Webhooks
- Kestovar Engine service binding
- D1 database + KV namespace configuration

### Changed
- Version bumped: 1.1.1 → 1.1.5
- Build bumped: 114 → 115

---

## [1.1.1] — 2026-08-07 (Build 114)

### Added
- First production-certified build
- Complete 16-gate deployment pipeline
- Stripe integration validated
- Kestovar integration verified
- All tests passing (33/33 unit, 24/24 E2E)

### Changed
- Build bumped: 113 → 114

---

## [1.1.1] — 2026-08-07 (Build 113)

### Added
- Comprehensive production certification
- Full test suite validation
- Security audit baseline

---

## [1.1.1] — 2026-08-06 (Build 111)

### Added
- Initial production readiness evaluation
- Foundational test suite
- Deployment checklist baseline

---

## Build 120 — Repository Finalization (2026-08-07)

### Added
- `ARCHITECTURE.md` — Ecosystem architecture documentation
- `DESIGN_SYSTEM.md` — Official design language
- `OPERATIONS_RUNBOOK.md` — Incident response procedures
- `MAINTENANCE_GUIDE.md` — Routine operational procedures
- `RELEASE_PROCESS.md` — Standardized release workflow
- `RELEASE_HISTORY_INDEX.md` — Release archive index
- `CHANGELOG.md` — Version history
- `LICENSE` — Project license
- `CONTRIBUTING.md` — Contribution guidelines
- `SECURITY.md` — Security policy
- `release-history/` — Organized historical releases

### Changed
- Repository root cleaned: historical docs moved to `release-history/`
- Standardized terminology: Kestovar, BuildSignal, Parcel Lead Pro
- Removed obsolete references: SignalCore, legacy naming, deprecated pricing

### Repository
- Historical certifications archived under `release-history/BuildXXX/`
- Evidence packages organized by build
- Change summaries for each historical build
