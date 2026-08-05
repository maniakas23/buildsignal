/**
 * Pricing utilities for BuildSignal
 */

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year";
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "starter",
    name: "Starter",
    price: 49,
    interval: "month",
    description: "For individual contractors and small teams",
    features: [
      "5 counties",
      "Basic alerts",
      "Weekly reports",
      "Email support",
    ],
    cta: "Get Started",
  },
  {
    id: "pro",
    name: "Pro",
    price: 149,
    interval: "month",
    description: "For growing construction businesses",
    features: [
      "25 counties",
      "Advanced alerts",
      "Daily reports",
      "Priority support",
      "API access",
      "Team collaboration",
    ],
    highlighted: true,
    cta: "Start Pro Trial",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 499,
    interval: "month",
    description: "For large organizations with custom needs",
    features: [
      "Unlimited counties",
      "Custom alerts",
      "Real-time reports",
      "Dedicated support",
      "Full API access",
      "SSO integration",
      "Custom integrations",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
  },
];

export function getTierById(id: string): PricingTier | undefined {
  return PRICING_TIERS.find((t) => t.id === id);
}

export function formatPrice(price: number, interval: string): string {
  return `$${price}/${interval === "year" ? "yr" : "mo"}`;
}

export function getAnnualSavings(tier: PricingTier): number {
  if (tier.interval === "year") return 0;
  const annualPrice = tier.price * 12;
  const discountedAnnual = annualPrice * 0.8; // 20% discount
  return annualPrice - discountedAnnual;
}
