/**
 * BuildSignal Canonical Pricing Module
 * Single source of truth for all pricing tiers.
 *
 * Approved plans: Scout | Professional | Business | Enterprise
 * No legacy values. No duplication.
 */

export type PlanId = "scout" | "professional" | "business" | "enterprise";

export interface PricingTier {
  id: PlanId;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: string[];
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "scout",
    name: "Scout",
    monthlyPrice: 99,
    yearlyPrice: 990,
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
    yearlyPrice: 2490,
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
    yearlyPrice: 5990,
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
      "Custom signal limits",
      "Custom integrations",
      "Dedicated infrastructure",
      "Unlimited users",
      "SLA guarantee",
      "On-premise option",
      "Custom contracts",
      "All Business features",
      "Priority engineering",
      "Dedicated support team",
      "Quarterly reviews",
      "Custom reporting",
    ],
  },
];

/** Ordered list of plan IDs from lowest to highest tier. */
export const PLAN_HIERARCHY: PlanId[] = ["scout", "professional", "business", "enterprise"];

/** Check if planA is strictly higher tier than planB. */
export function isPlanUpgrade(planA: PlanId, planB: PlanId): boolean {
  return PLAN_HIERARCHY.indexOf(planA) > PLAN_HIERARCHY.indexOf(planB);
}

/** Get a tier by its canonical ID. */
export function getTierById(id: PlanId): PricingTier | undefined {
  return PRICING_TIERS.find((tier) => tier.id === id);
}

/** Get monthly price for a tier. */
export function getMonthlyPrice(tierId: PlanId): number {
  return getTierById(tierId)?.monthlyPrice ?? 0;
}

/** Get yearly price for a tier. */
export function getYearlyPrice(tierId: PlanId): number {
  return getTierById(tierId)?.yearlyPrice ?? 0;
}

/** Format price for display. */
export function formatPrice(price: number, interval: "month" | "year"): string {
  if (price === 0) return "Custom";
  return `$${price}/${interval === "year" ? "yr" : "mo"}`;
}
