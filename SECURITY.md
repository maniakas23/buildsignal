# BuildSignal Security Policy

**Version:** 1.0  
**Last Updated:** 2026-08-07

---

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.1.9 (Build 119) | ✅ Active |
| 1.1.8 (Build 118) | ✅ Maintenance |
| < 1.1.8 | ❌ End of life |

---

## Security Model

### Authentication
- JWT-based authentication with secure cookies
- Token expiration: 24 hours
- Refresh token rotation enabled

### Authorization
- Role-based access control (RBAC)
- Organization-scoped permissions
- Resource-level access checks

### API Security
- Rate limiting via Cloudflare KV
- CORS configured for allowed origins only
- Input validation with Zod schemas
- SQL injection prevention via parameterized queries

### Secrets Management
- All secrets stored in Cloudflare Worker Secrets
- Never commit secrets to source control
- `.gitignore` excludes `.env`, `.env.*`, `*.pem`
- Regular secret rotation (quarterly)

### Data Protection
- D1 encryption at rest
- TLS 1.3 for all transport
- No PII stored without encryption
- Data retention policies enforced

---

## Reporting a Vulnerability

If you discover a security vulnerability in BuildSignal:

1. **Do NOT open a public issue**
2. Email security@buildsignal.net with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
3. Allow 48 hours for initial response
4. Allow 7 days for vulnerability assessment
5. Coordinate disclosure timeline

### What to Expect
- Acknowledgment within 48 hours
- Regular updates on remediation progress
- Credit in security advisory (if desired)
- No legal action for good-faith reports

---

## Security Checklist

### For Developers
- [ ] No secrets in source code
- [ ] Input validation on all endpoints
- [ ] Proper error handling (no sensitive data in errors)
- [ ] CORS configured correctly
- [ ] Rate limiting applied
- [ ] Dependencies audited (`npm audit`)

### For Operators
- [ ] Cloudflare Worker Secrets rotated quarterly
- [ ] D1 backups verified weekly
- [ ] Access logs reviewed monthly
- [ ] Security alerts monitored daily
- [ ] Incident response plan up to date

---

## Incident Response

See [OPERATIONS_RUNBOOK.md](./OPERATIONS_RUNBOOK.md) for detailed incident procedures.

### Severity Classification

| Severity | Description | Response Time |
|----------|-------------|---------------|
| Critical | Data breach, unauthorized access | 1 hour |
| High | Vulnerability exploitable in production | 4 hours |
| Medium | Vulnerability in non-critical path | 24 hours |
| Low | Defense in depth improvement | 7 days |

### Response Steps
1. Assess severity and impact
2. Contain the vulnerability
3. Develop and test fix
4. Deploy fix via hotfix process
5. Verify remediation
6. Document incident
7. Publish advisory if needed

---

## Compliance

- WCAG 2.1 AA accessibility compliance
- GDPR data protection principles
- SOC 2 Type II (planned)

---

## References

- [OPERATIONS_RUNBOOK.md](./OPERATIONS_RUNBOOK.md) — Incident response
- [MAINTENANCE_GUIDE.md](./MAINTENANCE_GUIDE.md) — Secret rotation procedures
- [CONTRIBUTING.md](./CONTRIBUTING.md) — Development security practices
