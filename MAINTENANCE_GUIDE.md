# BuildSignal Maintenance Guide

**Version:** 1.0  
**Status:** Active  
**Last Updated:** 2026-08-07

---

## Overview

This guide documents routine operational procedures for maintaining BuildSignal in production. Follow these procedures to keep the platform healthy, secure, and up to date.

---

## 1. Deployments

### Standard Deployment

1. Ensure all 16 gates pass (see [RELEASE_PROCESS.md](./RELEASE_PROCESS.md))
2. Deploy API worker:
   ```bash
   cd packages/api
   npx wrangler deploy
   ```
3. Deploy frontend:
   ```bash
   cd packages/frontend
   npm run build
   npx wrangler pages deploy dist
   ```
4. Verify deployment:
   ```bash
   curl https://api.buildsignal.net/health
   curl https://api.buildsignal.net/version
   ```

### Emergency Deployment

1. Identify fix needed
2. Create hotfix branch from `main`
3. Apply minimal fix
4. Run smoke tests only (skip full gate suite for critical fixes)
5. Deploy immediately
6. Full gate suite within 24 hours

---

## 2. Rollbacks

### Quick Rollback

```bash
# Identify last known good build
git tag | grep build- | sort -V | tail -5

# Checkout and deploy
git checkout build-118
cd packages/api && npx wrangler deploy
cd ../frontend && npm run build && npx wrangler pages deploy dist
```

### Database Rollback

1. Identify migration to rollback
2. Create reverse migration
3. Apply via wrangler:
   ```bash
   npx wrangler d1 migrations apply buildsignal-db
   ```

---

## 3. Database Migrations

### Creating a Migration

```bash
cd packages/api
npx wrangler d1 migrations create buildsignal-db "description"
```

### Applying Migrations

```bash
npx wrangler d1 migrations apply buildsignal-db --local    # Test locally
npx wrangler d1 migrations apply buildsignal-db            # Apply to production
```

### Migration Safety Rules

- Always test migrations locally first
- Backup data before production migrations
- Migrations must be backward compatible when possible
- Never drop columns without deprecation period
- Add new columns as nullable, populate, then add NOT NULL

---

## 4. Provider Onboarding

### Adding a New Data Provider

1. Define provider contract in `packages/api/contracts/`
2. Implement ingestion router
3. Add provider health checks
4. Configure rate limiting
5. Add to Operations Center monitoring
6. Document in provider runbook
7. Test with staging data

### Provider Configuration

```typescript
// packages/api/src/provider-router.ts
const PROVIDER_CONFIG = {
  name: "provider-name",
  endpoint: "https://api.provider.com/v1",
  rateLimit: 100, // requests per minute
  timeout: 30000, // ms
  retryAttempts: 3,
};
```

---

## 5. Secret Rotation

### Stripe Secrets

1. Generate new secret key in Stripe Dashboard
2. Set in Cloudflare:
   ```bash
   npx wrangler secret put STRIPE_SECRET_KEY
   npx wrangler secret put STRIPE_WEBHOOK_SECRET
   ```
3. Verify Stripe operations still work
4. Revoke old key in Stripe Dashboard

### JWT Secret

1. Generate new secret:
   ```bash
   openssl rand -base64 32
   ```
2. Set in Cloudflare:
   ```bash
   npx wrangler secret put JWT_SECRET
   ```
3. All existing sessions will be invalidated (users must re-login)
4. Communicate to users if needed

### API Keys

1. Generate new key
2. Update in Cloudflare secrets
3. Update any external integrations
4. Revoke old key

---

## 6. Dependency Updates

### Security Updates (Critical)

- Apply within 24 hours of release
- Test in staging first
- Deploy immediately if no breaking changes

### Minor Updates

- Review changelog for breaking changes
- Test in staging
- Deploy during maintenance window

### Major Updates

- Create spike task to assess impact
- Plan migration path
- Test thoroughly in staging
- Deploy with rollback plan ready

### Update Commands

```bash
# Check for outdated packages
npm outdated

# Update specific package
npm update package-name

# Update all packages (careful)
npm update

# Audit for vulnerabilities
npm audit
npm audit fix
```

---

## 7. Incident Response

See [OPERATIONS_RUNBOOK.md](./OPERATIONS_RUNBOOK.md) for detailed incident procedures.

### Severity Levels

| Level | Description | Response Time |
|-------|-------------|---------------|
| P1 | Critical — Platform down | 15 minutes |
| P2 | High — Major feature broken | 1 hour |
| P3 | Medium — Partial degradation | 4 hours |
| P4 | Low — Minor issue | 24 hours |

---

## 8. Release Process

See [RELEASE_PROCESS.md](./RELEASE_PROCESS.md) for complete release workflow.

---

## Maintenance Schedule

| Task | Frequency | Owner |
|------|-----------|-------|
| Security dependency audit | Weekly | Engineering |
| Full deployment pipeline | Per release | Release Engineer |
| Database backup verification | Weekly | SRE |
| Secret rotation (Stripe) | Quarterly | Security |
| Secret rotation (JWT) | Bi-annually | Security |
| Performance review | Monthly | Engineering |
| Provider health review | Monthly | Data Engineering |
| Access control audit | Quarterly | Security |
| Disaster recovery drill | Quarterly | SRE |
| Documentation review | Monthly | Tech Writing |

---

## Monitoring Checklist

### Daily
- [ ] API uptime (target: 99.9%)
- [ ] Error rate (target: < 0.1%)
- [ ] Queue depth (target: < 100)
- [ ] Stripe webhook success rate (target: 100%)

### Weekly
- [ ] Provider availability
- [ ] Recommendation latency
- [ ] Data freshness
- [ ] Infrastructure costs
- [ ] Security alerts

### Monthly
- [ ] Performance trends
- [ ] User growth
- [ ] Revenue metrics
- [ ] Provider quality scores
- [ ] Kestovar integration health

---

## References

- [OPERATIONS_RUNBOOK.md](./OPERATIONS_RUNBOOK.md) — Incident response
- [RELEASE_PROCESS.md](./RELEASE_PROCESS.md) — Release workflow
- [ARCHITECTURE.md](./ARCHITECTURE.md) — System architecture
