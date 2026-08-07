# Contributing to BuildSignal

Thank you for your interest in contributing to BuildSignal.

---

## Important Notice

BuildSignal is currently in **maintenance mode** per the Ecosystem Directive (Build 119).

### Allowed Contributions
- Critical bug fixes
- Security patches
- Performance optimizations
- New data providers
- Recommendation quality improvements
- Customer-requested usability improvements

### Not Accepted
- Architecture redesigns
- Major new features
- Breaking changes
- New UI frameworks or design systems

---

## Development Setup

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

### Environment
```bash
# Copy environment template
cp packages/frontend/.env.example packages/frontend/.env.local

# Set required secrets (never commit these)
# STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, JWT_SECRET
```

---

## Development Workflow

### Branch Naming
- `fix/description` — Bug fixes
- `security/description` — Security patches
- `perf/description` — Performance improvements
- `provider/description` — New data providers

### Commit Messages
```
type(scope): description

Examples:
fix(stripe): resolve webhook signature validation
security(auth): rotate JWT secret handling
perf(recommendations): cache Kestovar responses
provider(county): add new county data source
```

### Pull Request Process
1. Create branch from `main`
2. Make changes (minimal, focused)
3. Run tests locally
4. Submit PR with clear description
5. Request review from maintainers
6. Address feedback
7. Merge after approval

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
playwright test
```

### Smoke Tests
```bash
curl https://api.buildsignal.net/health
curl https://api.buildsignal.net/version
```

---

## Code Standards

### TypeScript
- Strict mode enabled
- No `any` types without justification
- Explicit return types on public functions

### Style
- Follow existing code patterns
- Use Tailwind CSS for styling
- Use shadcn/ui components where available

### Documentation
- Update relevant `.md` files for significant changes
- Add JSDoc comments for public APIs
- Update CHANGELOG.md

---

## Security

See [SECURITY.md](./SECURITY.md) for security policy and reporting procedures.

- Never commit secrets or API keys
- Use Cloudflare Worker Secrets for production credentials
- Run `npm audit` before submitting PRs

---

## Questions?

Open an issue for discussion before making significant changes.

---

## References

- [ARCHITECTURE.md](./ARCHITECTURE.md) — System architecture
- [SECURITY.md](./SECURITY.md) — Security policy
- [RELEASE_PROCESS.md](./RELEASE_PROCESS.md) — Release workflow
