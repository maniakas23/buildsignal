import React from "react";
import { Check, X } from "lucide-react";

interface Tier {
  name: string;
  features: { name: string; included: boolean }[];
}

const tiers: Tier[] = [
  {
    name: "Scout",
    features: [
      { name: "5 saved areas", included: true },
      { name: "50 signals/month", included: true },
      { name: "Email alerts", included: true },
      { name: "Basic analytics", included: true },
      { name: "1 user", included: true },
      { name: "CSV export", included: false },
      { name: "Advanced alerts", included: false },
      { name: "SSO / SAML", included: false },
      { name: "Webhook API", included: false },
      { name: "AI recommendations", included: false },
      { name: "Priority support", included: false },
      { name: "Dedicated account manager", included: false },
    ],
  },
  {
    name: "Professional",
    features: [
      { name: "20 saved areas", included: true },
      { name: "500 signals/month", included: true },
      { name: "Advanced alerts", included: true },
      { name: "Full analytics", included: true },
      { name: "CSV export", included: true },
      { name: "5 users", included: true },
      { name: "Priority support", included: true },
      { name: "SSO / SAML", included: false },
      { name: "Webhook API", included: false },
      { name: "AI recommendations", included: false },
      { name: "Unlimited areas", included: false },
      { name: "Dedicated account manager", included: false },
    ],
  },
  {
    name: "Business",
    features: [
      { name: "Unlimited saved areas", included: true },
      { name: "5,000 signals/month", included: true },
      { name: "AI-powered recommendations", included: true },
      { name: "Advanced analytics", included: true },
      { name: "All export formats", included: true },
      { name: "20 users", included: true },
      { name: "SSO / SAML", included: true },
      { name: "Webhook API", included: true },
      { name: "Dedicated account manager", included: true },
      { name: "Custom integrations", included: false },
      { name: "Unlimited signals", included: false },
      { name: "On-premise option", included: false },
    ],
  },
  {
    name: "Enterprise",
    features: [
      { name: "Custom signal limits", included: true },
      { name: "Custom integrations", included: true },
      { name: "Dedicated infrastructure", included: true },
      { name: "Unlimited users", included: true },
      { name: "SLA guarantee", included: true },
      { name: "On-premise option", included: true },
      { name: "Custom contracts", included: true },
      { name: "All Business features", included: true },
      { name: "Priority engineering", included: true },
      { name: "Dedicated support team", included: true },
      { name: "Quarterly reviews", included: true },
      { name: "Custom reporting", included: true },
    ],
  },
];

export function FeatureComparisonTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3">Feature</th>
            {tiers.map((tier) => (
              <th key={tier.name} className="text-center p-3">{tier.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tiers[0].features.map((feature, i) => (
            <tr key={feature.name} className="border-b">
              <td className="p-3">{feature.name}</td>
              {tiers.map((tier) => (
                <td key={tier.name} className="text-center p-3">
                  {tier.features[i].included ? (
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  ) : (
                    <X className="w-5 h-5 text-gray-300 mx-auto" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FeatureComparisonTable;
