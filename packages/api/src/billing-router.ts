/**
 * Billing Router — Build 110 / v1.1.0
 * Canonical 4-tier pricing: Scout / Professional / Business / Enterprise
 * Legacy plans map to the new tiers for backward compatibility
 */

import { createRouter, publicQuery } from "./middleware";

// ─── Canonical 4-tier pricing ───
export const PRICING_TIERS = [
  {
    id: "scout",
    name: "Scout",
    monthlyPrice: 99,
    yearlyPrice: 990, // 2 months free
    description: "Solo contractor / small crew",
    features: [
      "5 saved areas",
      "50 signals/month",
      "Email alerts",
      "Basic analytics",
      "1 user",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    monthlyPrice: 249,
    yearlyPrice: 2490, // 2 months free
    description: "Small to mid-size business",
    features: [
      "20 saved areas",
      "500 signals/month",
      "Advanced alerts",
      "Full analytics",
      "CSV export",
      "5 users",
      "Priority support",
    ],
  },
  {
    id: "business",
    name: "Business",
    monthlyPrice: 599,
    yearlyPrice: 5990, // 2 months free
    description: "Growing multi-crew operation",
    features: [
      "Unlimited saved areas",
      "5,000 signals/month",
      "AI-powered recommendations",
      "Advanced analytics",
      "All export formats",
      "20 users",
      "SSO / SAML",
      "Webhook API",
      "Dedicated account manager",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Custom pricing for large organizations",
    features: [
      "Everything in Business",
      "Custom signal limits",
      "Custom integrations",
      "Dedicated infrastructure",
      "Unlimited users",
      "SLA guarantee",
      "On-premise option",
      "Custom contracts",
    ],
  },
];

// ─── Legacy plan mapping ───
export const LEGACY_PLAN_MAP: Record<string, string> = {
  starter: "scout",
  basic: "scout",
  standard: "professional",
  pro: "professional",
  premium: "business",
  business: "business",
  enterprise: "enterprise",
  custom: "enterprise",
};

export function mapLegacyPlan(plan: string): string {
  return LEGACY_PLAN_MAP[plan.toLowerCase()] || "scout";
}

export const billingRouter = createRouter({
  // ─── Get all pricing tiers ───
  tiers: publicQuery.query(async () => {
    return { tiers: PRICING_TIERS };
  }),

  // ─── Get single tier ───
  tier: publicQuery
    .input((val: unknown) => {
      if (typeof val !== "string") throw new Error("Invalid input");
      return val;
    })
    .query(async ({ input }) => {
      const tier = PRICING_TIERS.find((t) => t.id === input);
      if (!tier) throw new Error("Tier not found");
      return { tier };
    }),

  // ─── Map legacy plan to new tier ───
  mapLegacy: publicQuery
    .input((val: unknown) => {
      if (typeof val !== "string") throw new Error("Invalid input");
      return val;
    })
    .query(async ({ input }) => {
      return { newTier: mapLegacyPlan(input) };
    }),
});

export type BillingRouter = typeof billingRouter;
