#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# BuildSignal Production Deployment Script — Fail-Closed (Build 110 / v1.1.0)
#
# Deploys the Cloudflare Workers stack:
#   1. API Worker        (api.buildsignal.com)
#   2. Frontend Pages    (app.buildsignal.com)
#
# Usage: ./deploy.sh [production|preview]
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

ENVIRONMENT="${1:-production}"

echo "BuildSignal Deployment — Environment: $ENVIRONMENT"
echo ""

# ─── Validate environment ───
if [[ "$ENVIRONMENT" != "production" && "$ENVIRONMENT" != "preview" ]]; then
  echo "Invalid environment. Use: production | preview"
  exit 1
fi

# ─── Step 1: Typecheck (fail-closed) ───
echo "Step 1: TypeScript typecheck..."
if ! (cd packages/api && npx tsc -b --pretty false); then
  echo "FATAL: API typecheck failed"
  exit 1
fi
if ! (cd packages/frontend && npx tsc -b --pretty false); then
  echo "FATAL: Frontend typecheck failed"
  exit 1
fi
echo "Typecheck passed"
echo ""

# ─── Step 2: Lint (fail-closed) ───
echo "Step 2: ESLint..."
if ! (cd packages/api && npx eslint src/ --ext .ts); then
  echo "FATAL: API lint failed"
  exit 1
fi
if ! (cd packages/frontend && npx eslint src/ --ext .ts,.tsx); then
  echo "FATAL: Frontend lint failed"
  exit 1
fi
echo "Lint passed"
echo ""

# ─── Step 3: Content scan (fail-closed) ───
echo "Step 3: Content scan..."
if ! node scripts/content-scan.js; then
  echo "FATAL: Content scan failed — simulated/fake/unsupported claims detected"
  exit 1
fi
echo "Content scan passed"
echo ""

# ─── Step 4: Playwright E2E tests (fail-closed) ───
echo "Step 4: Playwright E2E tests..."
if ! (cd packages/frontend && npx playwright test --reporter=line); then
  echo "FATAL: Playwright E2E tests failed"
  exit 1
fi
echo "Playwright tests passed"
echo ""

# ─── Step 5: Unit tests (fail-closed) ───
echo "Step 5: Running unit tests..."
if ! (cd packages/api && npx vitest run --reporter=verbose); then
  echo "FATAL: API unit tests failed"
  exit 1
fi
if ! (cd packages/frontend && npx vitest run --reporter=verbose); then
  echo "FATAL: Frontend unit tests failed"
  exit 1
fi
echo "Unit tests passed"
echo ""

# ─── Step 6: D1 Migrations ───
if [[ "$ENVIRONMENT" == "preview" ]]; then
  echo "Step 6: Applying D1 migrations to preview..."
  npx wrangler d1 migrations apply buildsignal-db-preview --remote \
    --config packages/api/wrangler.toml
  echo "Preview migrations applied"
else
  echo "Step 6: D1 migrations for PRODUCTION must be applied manually:"
  echo "   npx wrangler d1 migrations apply buildsignal-db-production --remote \\"
  echo "     --config packages/api/wrangler.toml"
  echo "   Skipping automatic migration for safety."
fi
echo ""

# ─── Step 7: API deploy dry-run (fail-closed) ───
echo "Step 7: API deploy dry-run..."
if ! (cd packages/api && npx wrangler deploy --dry-run); then
  echo "FATAL: API deploy dry-run failed"
  exit 1
fi
echo "API dry-run passed"
echo ""

# ─── Step 8: Deploy API Worker ───
echo "Step 8: Deploying API Worker..."
if [[ "$ENVIRONMENT" == "preview" ]]; then
  cd packages/api && npx wrangler deploy --env preview && cd ../..
else
  cd packages/api && npx wrangler deploy && cd ../..
fi
echo "API Worker deployed"
echo ""

# ─── Step 9: Health checks (fail-closed) ───
echo "Step 9: Health checks..."
API_URL="https://api.buildsignal.com"
if [[ "$ENVIRONMENT" == "preview" ]]; then
  API_URL="https://api-preview.buildsignal.com"
fi

HEALTH_OK=false
for attempt in 1 2 3; do
  echo "   Health check attempt $attempt..."
  if curl -sf "$API_URL/health" > /dev/null 2>&1 && curl -sf "$API_URL/ready" > /dev/null 2>&1; then
    HEALTH_OK=true
    break
  fi
  echo "   Health check failed, retrying in 5s..."
  sleep 5
done

if [[ "$HEALTH_OK" != "true" ]]; then
  echo "FATAL: API health checks failed after 3 attempts. Deployment is unhealthy."
  echo "       Rolling back is NOT automatic. Check the Worker logs and Wrangler dashboard."
  exit 1
fi
echo "Health checks passed"
echo ""

# ─── Step 10: Build frontend ───
echo "Step 10: Building frontend..."
if ! (cd packages/frontend && npx vite build); then
  echo "FATAL: Frontend build failed"
  exit 1
fi
echo "Frontend built"
echo ""

# ─── Step 11: Deploy Frontend ───
echo "Step 11: Deploying Frontend to Cloudflare Pages..."
if [[ "$ENVIRONMENT" == "preview" ]]; then
  npx wrangler pages deploy packages/frontend/dist \
    --project-name buildsignal-app-production \
    --branch preview
else
  npx wrangler pages deploy packages/frontend/dist \
    --project-name buildsignal-app-production \
    --branch production
fi
echo "Frontend deployed"
echo ""

# ─── Step 12: Smoke tests (fail-closed) ───
echo "Step 12: Running smoke tests..."
APP_URL="https://app.buildsignal.com"
if [[ "$ENVIRONMENT" == "preview" ]]; then
  APP_URL="https://preview.buildsignal.com"
fi

SMOKE_OK=false
for attempt in 1 2 3; do
  echo "   Smoke test attempt $attempt..."
  if curl -sf "$APP_URL" > /dev/null 2>&1; then
    SMOKE_OK=true
    break
  fi
  echo "   Smoke test failed, retrying in 5s..."
  sleep 5
done

if [[ "$SMOKE_OK" != "true" ]]; then
  echo "FATAL: Frontend smoke tests failed after 3 attempts. Site may not be reachable."
  exit 1
fi
echo "Smoke tests passed"
echo ""

# ─── Done ───
echo "BuildSignal $ENVIRONMENT deployment complete!"
echo ""
echo "   Frontend: $APP_URL"
echo "   API:      $API_URL"
echo ""
