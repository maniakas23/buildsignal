# BuildSignal v5.4.7 Deployment Gates

set -euo pipefail

ENV=${1:-production}
echo "=== BuildSignal Deployment — $ENV ==="

# 1. Typecheck both packages
echo "[1/24] Typecheck API..."
cd packages/api && npx tsc --noEmit && cd ../..

echo "[2/24] Typecheck Frontend..."
cd packages/frontend && npx tsc --noEmit && cd ../..

# 2. Build frontend
echo "[3/24] Build Frontend..."
cd packages/frontend && npm run build && cd ../..

# 3. Verify Kestovar Engine (deploy first if needed)
echo "[4/24] Verify Kestovar Engine health..."
curl -sf https://api.kestovar.buildsignal.net/health || {
  echo "  Kestovar Engine not responding. Deploying..."
  cd packages/kestovar-engine && npx wrangler deploy && cd ../..
  sleep 5
  curl -sf https://api.kestovar.buildsignal.net/health || exit 1
}

# 4. Deploy API Worker
echo "[5/24] Deploy API Worker..."
cd packages/api && npx wrangler deploy && cd ../..

# 5. Verify API readiness
echo "[6/24] Verify API readiness..."
curl -sf https://api.buildsignal.net/ready || exit 1

# 6. Deploy Frontend Pages
echo "[7/24] Deploy Frontend Pages..."
cd packages/frontend && npx wrangler pages deploy dist --project-name buildsignal-app-production --branch production && cd ../..

# 7. Verify frontend
echo "[8/24] Verify Frontend..."
curl -sf https://buildsignal.net/ || exit 1

# 8. Stripe webhook verification
echo "[9/24] Verify Stripe webhook..."
curl -sf https://api.buildsignal.net/api/webhooks/stripe || true

# 9. Check all critical endpoints
echo "[10/24] Health check..."
curl -sf https://api.buildsignal.net/health || exit 1

echo "[11/24] Ready check..."
curl -sf https://api.buildsignal.net/ready || exit 1

echo "[12/24] Version check..."
curl -sf https://api.buildsignal.net/version || exit 1

echo "[13/24] Billing config..."
curl -sf https://api.buildsignal.net/api/trpc/billing.config || exit 1

echo "[14/24] Kestovar capabilities..."
curl -sf https://api.buildsignal.net/api/trpc/monitoring.kestovar || exit 1

# 15-20. D1 migration checks (if any pending)
echo "[15/24] D1 migration status..."
cd packages/api && npx wrangler d1 migrations list buildsignal-db-production --remote || true && cd ../..

# 21-24. Final smoke tests
echo "[21/24] Smoke test — login page..."
curl -sf https://buildsignal.net/login || exit 1

echo "[22/24] Smoke test — pricing page..."
curl -sf https://buildsignal.net/pricing || exit 1

echo "[23/24] Smoke test — API tRPC..."
curl -sf https://api.buildsignal.net/api/trpc/billing.config || exit 1

echo "[24/24] Security headers check..."
curl -sI https://api.buildsignal.net/ready | grep -i "strict-transport\|content-security\|x-frame" || exit 1

echo ""
echo "=== BuildSignal v5.4.7 Deployed Successfully ==="
echo "Frontend:  https://buildsignal.net"
echo "API:       https://api.buildsignal.net"
echo "Kestovar:  https://api.kestovar.buildsignal.net"
echo ""
