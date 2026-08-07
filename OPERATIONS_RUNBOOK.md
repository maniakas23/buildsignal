# BuildSignal Operations Runbook

**Version:** 1.0  
**Status:** Active  
**Last Updated:** 2026-08-07

---

## Overview

This runbook documents procedures for responding to operational incidents in BuildSignal production. Every procedure includes detection, diagnosis, recovery, verification, and post-incident review.

---

## 1. API Outage

### Detection
- Alert: Cloudflare Workers error rate > 1%
- Alert: `/health` endpoint non-200 for > 30 seconds
- Customer report: Unable to access application

### Diagnosis
```bash
# Check worker status
curl https://api.buildsignal.net/health
curl https://api.buildsignal.net/ready

# Check Cloudflare dashboard
# Workers & Pages > buildsignal-worker > Analytics

# Check recent deployments
# GitHub Actions > Deploy workflow
```

### Recovery
1. Verify if issue is Cloudflare platform-wide (check Cloudflare status page)
2. If recent deployment caused issue:
   ```bash
   git checkout build-118
   cd packages/api && npx wrangler deploy
   ```
3. If D1 database issue: Check D1 status in Cloudflare dashboard
4. If KV issue: Verify KV namespace `RATE_LIMIT` is accessible

### Verification
- `/health` returns 200 with correct build number
- `/ready` returns `ready: true`
- Key user flows functional (login, dashboard, billing)

### Post-Incident Review
- Document root cause in incident log
- Update runbook if procedure needs refinement
- Schedule follow-up for preventive measures

---

## 2. Provider Failure

### Detection
- Alert: Provider health check failing
- Alert: Data ingestion rate drops to zero
- Kestovar circuit breaker trips OPEN

### Diagnosis
```bash
# Check provider status in Operations Center
# Review Kestovar health metrics
# Check provider-specific error logs
```

### Recovery
1. Identify which provider is failing
2. Check provider's own status page
3. If temporary: Wait for provider recovery (circuit breaker will auto-close)
4. If persistent: Disable provider in configuration
5. Notify customers if data freshness is impacted

### Verification
- Provider health check passes
- Data ingestion resumes
- Circuit breaker state returns to CLOSED

---

## 3. Queue Backlog

### Detection
- Alert: Queue depth > 1000 messages
- Alert: Processing latency > 5 minutes
- Dashboard: Queue growth rate positive

### Diagnosis
```bash
# Check Cloudflare Queues dashboard
# Review worker CPU/memory usage
# Check for blocked database queries
```

### Recovery
1. Scale worker resources if possible
2. Identify and kill stuck jobs
3. If database bottleneck: Check D1 query performance
4. If temporary spike: Allow backlog to drain naturally
5. If persistent: Add additional worker instances

### Verification
- Queue depth returns to normal (< 100)
- Processing latency < 30 seconds
- No lost messages

---

## 4. D1 Database Issues

### Detection
- Alert: D1 query error rate > 0.1%
- Alert: D1 latency > 2 seconds
- Application: Database connection errors

### Diagnosis
```bash
# Check D1 status in Cloudflare dashboard
# Review recent migrations
# Check for long-running queries
```

### Recovery
1. Check if issue is Cloudflare D1 platform-wide
2. If migration caused issue: Rollback to previous schema
3. If query performance: Add indexes or optimize queries
4. If capacity: Contact Cloudflare support

### Verification
- D1 health check passes
- Query latency < 500ms
- All CRUD operations functional

---

## 5. Cloudflare Deployment Failure

### Detection
- GitHub Actions deployment workflow fails
- Wrangler deploy returns error
- New build not reflected in `/version` endpoint

### Diagnosis
```bash
# Check GitHub Actions logs
# Verify wrangler.toml configuration
# Check Cloudflare API token permissions
```

### Recovery
1. Read deployment error message carefully
2. Common issues:
   - Invalid wrangler.toml syntax → Fix and retry
   - Missing secrets → Set via `wrangler secret put`
   - API token expired → Rotate token
   - Bundle size exceeded → Optimize build
3. Retry deployment
4. If persistent: Deploy previous working build

### Verification
- `/version` returns new build number
- `/health` returns 200
- Smoke tests pass

---

## 6. Stripe Failures

### Detection
- Alert: Stripe webhook error rate > 1%
- Alert: Checkout creation failing
- Customer report: Unable to subscribe

### Diagnosis
```bash
# Check Stripe Dashboard > Developers > Webhooks
# Verify webhook signature validation
# Check Stripe API status
```

### Recovery
1. Check Stripe API status page
2. Verify `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are set
3. Check webhook endpoint URL is correct
4. If webhook failing: Re-register webhook endpoint
5. If API issues: Wait for Stripe resolution

### Verification
- Test checkout session creation
- Test billing portal access
- Verify webhook events processing

---

## 7. Authentication Failures

### Detection
- Alert: Login error rate > 5%
- Alert: JWT validation failures
- Customer report: Cannot log in

### Diagnosis
```bash
# Check auth provider status (Clerk/Auth0)
# Verify JWT secret configuration
# Check cookie/domain settings
```

### Recovery
1. Check auth provider status page
2. Verify `JWT_SECRET` is correctly set
3. Check CORS configuration allows frontend domain
4. If cookie issues: Verify secure/same-site settings
5. If provider down: Implement fallback or maintenance mode

### Verification
- Login flow works end-to-end
- Token refresh functional
- Session persistence correct

---

## 8. Performance Degradation

### Detection
- Alert: API p95 latency > 2 seconds
- Alert: Frontend load time > 5 seconds
- Customer report: Application is slow

### Diagnosis
```bash
# Check Cloudflare Analytics
# Review slow query logs
# Check frontend bundle size
# Analyze network waterfall
```

### Recovery
1. Identify bottleneck (API, database, frontend, network)
2. API slow: Check database queries, add caching
3. Frontend slow: Optimize bundle, lazy load components
4. Database slow: Add indexes, optimize queries
5. If traffic spike: Enable rate limiting, scale resources

### Verification
- p95 latency < 500ms
- Frontend load time < 3 seconds
- Core Web Vitals pass

---

## Incident Response Checklist

- [ ] Acknowledge alert within 5 minutes
- [ ] Assess severity (P1-critical, P2-high, P3-medium, P4-low)
- [ ] Communicate to team via incident channel
- [ ] Follow relevant runbook procedure
- [ ] Document actions taken
- [ ] Verify recovery
- [ ] Write post-incident review within 24 hours
- [ ] Update runbook if needed

---

## Contact Information

| Role | Contact |
|------|---------|
| On-call Engineer | #incidents Slack channel |
| Cloudflare Support | dashboard > Support |
| Stripe Support | dashboard > Support |
| Auth Provider | Check provider status page |

---

## References

- [MAINTENANCE_GUIDE.md](./MAINTENANCE_GUIDE.md) — Routine procedures
- [ARCHITECTURE.md](./ARCHITECTURE.md) — System architecture
- [RELEASE_PROCESS.md](./RELEASE_PROCESS.md) — Deployment workflow
