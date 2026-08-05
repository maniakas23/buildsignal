/**
 * Environment variable loader — Cloudflare Workers compatible.
 *
 * On Cloudflare Workers: process.env is polyfilled by functions/[[path]].ts
 * from Cloudflare env bindings before this module is imported.
 *
 * On Node.js: api/boot.ts imports dotenv/config before importing this module.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

// Lazy production detection — avoids false negative when env.ts is
// imported before index.ts sets NODE_ENV (static import chain issue).
function isProduction(): boolean {
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv === "production") return true;
  if (nodeEnv === "development") return false;
  // Cloudflare Workers: no NODE_ENV set yet → check production indicators
  const cfEnv = (globalThis as unknown as Record<string, unknown>).__CF_ENV__;
  if (cfEnv && (cfEnv as Record<string, unknown>).ENVIRONMENT === "production") return true;
  // Default to production in deployed Workers (no dev tooling present)
  return true;
}

export const env = {
  appId: required("APP_ID"),
  appSecret: required("APP_SECRET"),
  get isProduction() { return isProduction(); },
  databaseUrl: process.env.DATABASE_URL ?? "", // Optional: D1 uses env.DB binding
  kimiAuthUrl: process.env.KIMI_AUTH_URL ?? "https://auth.kimi.com",
  kimiOpenUrl: process.env.KIMI_OPEN_URL ?? "https://open.kimi.com",
  ownerUnionId: process.env.OWNER_UNION_ID,
  internalApiSecret: process.env.INTERNAL_API_SECRET,
  // Stripe configuration (server-side only)
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  stripePriceScout: process.env.STRIPE_PRICE_SCOUT,
  stripePricePro: process.env.STRIPE_PRICE_PRO,
  stripePriceBusiness: process.env.STRIPE_PRICE_BUSINESS,
  stripePriceEnterprise: process.env.STRIPE_PRICE_ENTERPRISE,
};
