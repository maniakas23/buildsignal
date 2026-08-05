import { useState } from "react";
import { Check, CreditCard, TrendingUp, Zap, Users, Shield, Globe } from "lucide-react";

export function PricingTiers() {
  const [plans] = useState([
    {
      id: "scout",
      name: "Scout",
      price: 99,
      description: "For individual builders and small teams",
      features: ["5 counties", "Daily briefings", "Email alerts", "Basic analytics", "Community support"],
      highlighted: false,
    },
    {
      id: "professional",
      name: "Professional",
      price: 249,
      description: "For growing construction firms",
      features: ["20 counties", "Real-time alerts", "Priority recommendations", "API access", "Priority support", "Custom reports"],
      highlighted: true,
    },
    {
      id: "business",
      name: "Business",
      price: 599,
      description: "For established construction companies",
      features: ["50 counties", "Full API", "Custom reports", "Priority support", "SSO", "Dedicated account manager"],
      highlighted: false,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: 0,
      description: "For large organizations",
      features: ["Unlimited counties", "Custom API limits", "White-glove support", "Custom integrations", "SLA", "On-premise option"],
      highlighted: false,
    },
  ]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={`p-6 border rounded-lg ${plan.highlighted ? "border-primary ring-2 ring-primary" : ""}`}
        >
          <div className="mb-4">
            <div className="font-semibold text-lg">{plan.name}</div>
            <div className="text-sm text-muted-foreground">{plan.description}</div>
          </div>

          <div className="mb-4">
            <span className="text-3xl font-bold">{plan.price === 0 ? "Custom" : `$${plan.price}`}</span>
            {plan.price > 0 && <span className="text-muted-foreground">/month</span>}
          </div>

          <ul className="space-y-2 mb-6">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>

          <button
            className={`w-full rounded-lg px-4 py-2 text-sm font-medium ${
              plan.highlighted
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border border-input hover:bg-accent"
            }`}
          >
            {plan.price === 0 ? "Contact Sales" : "Subscribe"}
          </button>
        </div>
      ))}
    </div>
  );
}
