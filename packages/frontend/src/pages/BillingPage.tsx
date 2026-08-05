import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Check, X } from "lucide-react";
import { trpc } from "@/providers/trpc";

export function BillingPage() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const subscription = trpc.stripe.getSubscription.useQuery();
  const checkout = trpc.stripe.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
  });

  const handlePlanSelect = (plan: string) => {
    setSelectedPlan(plan);
    checkout.mutate({ plan: plan as any });
  };

  const plans = [
    { id: "scout", name: "Scout", price: "$99", interval: "/month", features: ["5 counties", "Daily briefings", "Email alerts"] },
    { id: "professional", name: "Professional", price: "$249", interval: "/month", features: ["20 counties", "Real-time alerts", "Priority recommendations", "API access"], highlighted: true },
    { id: "business", name: "Business", price: "$599", interval: "/month", features: ["50 counties", "Full API", "Custom reports", "Priority support"] },
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Billing</h1>

      <div className="mb-8 p-6 border rounded-lg bg-card">
        <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
        <p className="text-muted-foreground">
          {subscription.data?.planId
            ? `Active: ${subscription.data.planId}`
            : "No active subscription"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`p-6 border rounded-lg ${plan.highlighted ? "border-primary ring-1 ring-primary" : ""}`}
          >
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <div className="mt-4">
              <span className="text-3xl font-bold">{plan.price}</span>
              <span className="text-muted-foreground">{plan.interval}</span>
            </div>
            <ul className="mt-4 space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handlePlanSelect(plan.id)}
              disabled={checkout.isPending}
              className="mt-6 w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {checkout.isPending ? "Loading..." : "Subscribe"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
