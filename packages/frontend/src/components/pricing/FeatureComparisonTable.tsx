import { useState } from "react";
import { Check, X, HelpCircle } from "lucide-react";

export function FeatureComparisonTable() {
  const [plans] = useState([
    { name: "Scout", price: "$99/mo", features: { counties: "5", alerts: "Email", api: false, sso: false, support: "Email", reports: false, custom: false } },
    { name: "Professional", price: "$249/mo", features: { counties: "20", alerts: "Real-time", api: true, sso: false, support: "Priority", reports: true, custom: false } },
    { name: "Business", price: "$599/mo", features: { counties: "50", alerts: "Real-time", api: true, sso: true, support: "Dedicated", reports: true, custom: true } },
    { name: "Enterprise", price: "Custom", features: { counties: "Unlimited", alerts: "Real-time", api: true, sso: true, support: "White-glove", reports: true, custom: true } },
  ]);

  const featureRows = [
    { key: "counties", label: "Counties Tracked" },
    { key: "alerts", label: "Alert Delivery" },
    { key: "api", label: "API Access" },
    { key: "sso", label: "Enterprise SSO" },
    { key: "support", label: "Support Level" },
    { key: "reports", label: "Custom Reports" },
    { key: "custom", label: "Custom Integrations" },
  ];

  return (
    <div className="p-6 border rounded-lg bg-card overflow-x-auto">
      <h3 className="text-lg font-semibold mb-6">Feature Comparison</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">Feature</th>
            {plans.map((plan) => (
              <th key={plan.name} className="text-center py-3 px-4">
                <div className="font-medium">{plan.name}</div>
                <div className="text-xs text-muted-foreground">{plan.price}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {featureRows.map((row) => (
            <tr key={row.key} className="border-b hover:bg-accent/50">
              <td className="py-3 px-4 font-medium">{row.label}</td>
              {plans.map((plan) => (
                <td key={plan.name} className="text-center py-3 px-4">
                  {typeof plan.features[row.key as keyof typeof plan.features] === "boolean" ? (
                    plan.features[row.key as keyof typeof plan.features] ? (
                      <Check className="h-4 w-4 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground mx-auto" />
                    )
                  ) : (
                    <span>{plan.features[row.key as keyof typeof plan.features]}</span>
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
