import { useState } from "react";
import { Check, Building2 } from "lucide-react";
import { trpc } from "@/providers/trpc";

export function PricingPage() {
  const config = trpc.billing.config.useQuery();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = config.data?.plans || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Pricing</h1>
          <p className="text-xl text-muted-foreground">
            Choose the plan that fits your intelligence needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`p-6 border rounded-lg ${plan.highlighted ? "border-primary ring-2 ring-primary" : ""}`}
            >
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <div className="mt-4">
                <span className="text-3xl font-bold">
                  {plan.price === 0 ? "Custom" : `$${plan.price}`}
                </span>
                {plan.price > 0 && (
                  <span className="text-muted-foreground">/{plan.interval}</span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((feature: string) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setSelectedPlan(plan.id)}
                className={`mt-6 w-full rounded-lg px-4 py-2 text-sm font-medium ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-input hover:bg-accent"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Building2 className="h-5 w-5" />
            <span>Enterprise? Contact us for custom pricing</span>
          </div>
        </div>
      </div>
    </div>
  );
}
