/**
 * Canonical pricing tiers — Build 110 / v1.1.0
 * Scout / Professional / Business / Enterprise
 */

export interface PricingTier {
  id: string;
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

export function getTierById(id: string): PricingTier | undefined {
  return PRICING_TIERS.find((tier) => tier.id === id);
}

export function getMonthlyPrice(tierId: string): number {
  return getTierById(tierId)?.monthlyPrice ?? 0;
}

export function getYearlyPrice(tierId: string): number {
  return getTierById(tierId)?.yearlyPrice ?? 0;
}
