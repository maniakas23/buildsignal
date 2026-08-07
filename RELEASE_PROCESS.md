# BuildSignal Release Process

**Version:** 1.0  
**Status:** Active  
**Last Updated:** 2026-08-07

---

## Overview

This document defines the standardized release process for BuildSignal. Every production release must follow this process to ensure quality, traceability, and rollback capability.

---

## Release Types

| Type | Description | Gate Requirements |
|------|-------------|-------------------|
| Standard | Scheduled feature release | All 16 gates |
| Hotfix | Critical bug fix | Smoke tests + affected gates |
| Security | Security patch | All 16 gates (accelerated) |
| Maintenance | Dependency update | Smoke tests + compatibility |

---

## 16-Gate Deployment Pipeline

### Gate 1 — Dependency Installation
```bash
npm install --force --ignore-scripts
```
- All packages install without errors
- Lockfile is updated if needed

### Gate 2 — TypeScript Compilation
```bash
tsc --noEmit --project tsconfig.build.json
```
- Zero TypeScript errors on critical files

### Gate 3 — Linting
```bash
npm run lint
```
- Zero linting errors
- No new warnings introduced

### Gate 4 — Unit Tests
```bash
vitest run src/tests/
```
- All tests passing (target: 33/33)
- Coverage meets threshold (> 80%)

### Gate 5 — E2E Tests
```bash
playwright test
```
- All tests passing (target: 24/24)
- Zero failures, zero skipped

### Gate 6 — Pricing Scan
```bash
grep -r "\$49\|\$149\|Starter\|Pro" packages/ --include="*.ts" --include="*.tsx"
```
- Zero legacy pricing references

### Gate 7 — Content Truth
```bash
grep -ri "sample user\|sample organization\|simulated\|mock data" packages/ --include="*.ts" --include="*.tsx"
```
- Zero simulated data in production source

### Gate 8 — Wrangler Config
```bash
npx wrangler deploy --dry-run
```
- Worker bindings verified (KV, D1, Kestovar)
- No configuration errors

### Gate 9 — Frontend Build
```bash
cd packages/frontend && npm run build
```
- Build completes without errors
- Output in `dist/` directory

### Gate 10 — Database Migration
```bash
npx wrangler d1 migrations apply buildsignal-db --local
```
- Schema enum matches canonical plan IDs
- Migrations apply cleanly

### Gate 11 — Kestovar Integration
```bash
vitest run src/tests/kestovar.test.ts
```
- All assertions pass (target: 27/27)
- Circuit breaker functional

### Gate 12 — Stripe Validation
```bash
# Verify plan IDs match canonical pricing
# Verify webhook endpoint configured
# Test checkout session creation (test mode)
```
- All 4 canonical plans verified
- Webhook signature validation works

### Gate 13 — API Deployment
```bash
cd packages/api && npx wrangler deploy
```
- Deployment succeeds
- Deployment ID recorded

### Gate 14 — Frontend Deployment
```bash
cd packages/frontend && npx wrangler pages deploy dist
```
- Deployment succeeds
- Pages site active

### Gate 15 — Smoke Tests
```bash
curl https://api.buildsignal.net/health
curl https://api.buildsignal.net/ready
curl https://api.buildsignal.net/version
curl https://api.buildsignal.net/capabilities
```
- All endpoints return correct build number
- Frontend loads (HTTP 200)

### Gate 16 — Rollback Verification
```bash
git tag build-XXX
git push origin build-XXX
```
- Tag created and pushed
- Rollback path documented

---

## Release Workflow

### Pre-Release (Day -2)

1. Create release branch: `git checkout -b release/vX.Y.Z`
2. Update version numbers in:
   - `packages/api/deploy-minimal.js`
   - `package.json`
   - Any version-referencing files
3. Update `CHANGELOG.md`
4. Run full test suite locally

### Release Day

1. **Morning:** Final code review and approval
2. **Execute 16-gate pipeline**
3. **If any gate fails:** STOP, fix, restart from Gate 1
4. **All gates pass:** Proceed to deployment
5. **Deploy API:** `npx wrangler deploy`
6. **Deploy Frontend:** `npm run build && npx wrangler pages deploy dist`
7. **Verify:** Run smoke tests against production
8. **Tag:** `git tag build-XXX && git push origin build-XXX`
9. **Certify:** Generate `BUILDSIGNAL_BUILDXXX_PRODUCTION_CERTIFICATION.md`
10. **Archive:** Move previous certification to `release-history/`

### Post-Release

1. Monitor error rates for 2 hours
2. Verify Stripe webhooks processing
3. Check Kestovar integration health
4. Announce release to team
5. Update release history index

---

## Evidence Collection

Every release must produce:

1. **Certification Document** — `BUILDSIGNAL_BUILDXXX_PRODUCTION_CERTIFICATION.md`
2. **Release Evidence ZIP** — `BuildSignal-vX.Y.Z-release-evidence.zip`
3. **Gate Logs** — Individual logs for each of 16 gates
4. **Change Summary** — `release-history/BuildXXX/CHANGE_SUMMARY.md`

---

## Rollback Procedure

### Immediate Rollback (< 1 hour after deployment)

```bash
# Deploy previous build
git checkout build-118
cd packages/api && npx wrangler deploy
cd ../frontend && npm run build && npx wrangler pages deploy dist

# Verify
 curl https://api.buildsignal.net/version
```

### Delayed Rollback (> 1 hour after deployment)

1. Assess data impact (database migrations, user data)
2. Create reverse migration if needed
3. Deploy previous build
4. Verify data integrity
5. Communicate to users if data was affected

---

## Emergency Release

For critical security patches or outages:

1. Skip non-critical gates (document which were skipped)
2. Run smoke tests minimum
3. Deploy immediately
4. Full gate suite within 24 hours
5. Post-incident review required

---

## Version Numbering

BuildSignal follows semantic versioning:

| Component | Meaning | Example |
|-----------|---------|---------|
| Major (X) | Breaking changes, architecture shifts | 2.0.0 |
| Minor (Y) | New features, non-breaking | 1.2.0 |
| Patch (Z) | Bug fixes, security patches | 1.1.9 |

Build numbers are sequential integers independent of semver:
- Build 119 → v1.1.9
- Build 120 → v1.1.10 (or v1.2.0 if minor release)

---

## References

- [MAINTENANCE_GUIDE.md](./MAINTENANCE_GUIDE.md) — Operational procedures
- [OPERATIONS_RUNBOOK.md](./OPERATIONS_RUNBOOK.md) — Incident response
- [ARCHITECTURE.md](./ARCHITECTURE.md) — System architecture
