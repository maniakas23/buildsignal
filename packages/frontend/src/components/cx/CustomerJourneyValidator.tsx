import { useEffect, useState } from "react";
import { Route, Link, ShoppingCart, CheckCircle, ChevronRight, MapPin, CreditCard, Shield, ArrowRight } from "lucide-react";

export function CustomerJourneyValidator() {
  const [steps, setSteps] = useState([
    { id: "discovery", label: "Discovery", status: "complete", description: "User lands on pricing page" },
    { id: "signup", label: "Sign Up", status: "complete", description: "Creates account via Kimi SSO" },
    { id: "onboarding", label: "Onboarding", status: "complete", description: "Completes county selection" },
    { id: "activation", label: "Activation", status: "in_progress", description: "First recommendation viewed" },
    { id: "purchase", label: "Purchase", status: "pending", description: "Subscribes to paid plan" },
    { id: "retention", label: "Retention", status: "pending", description: "Weekly active usage" },
  ]);

  const [analytics, setAnalytics] = useState({
    dropOffRate: 0.23,
    avgTimeToPurchase: "4.2 days",
    conversionRate: 0.12,
    funnelHealth: "good",
  });

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Route className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Customer Journey Validation</h3>
        </div>
        <div className={`text-sm font-medium px-3 py-1 rounded-full ${
          analytics.funnelHealth === "good" ? "bg-green-50 text-green-700" :
          analytics.funnelHealth === "warning" ? "bg-yellow-50 text-yellow-700" :
          "bg-red-50 text-red-700"
        }`}>
          Funnel Health: {analytics.funnelHealth}
        </div>
      </div>

      {/* Funnel Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-3 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Drop-off Rate</div>
          <div className="text-lg font-bold">{(analytics.dropOffRate * 100).toFixed(0)}%</div>
        </div>
        <div className="p-3 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Time to Purchase</div>
          <div className="text-lg font-bold">{analytics.avgTimeToPurchase}</div>
        </div>
        <div className="p-3 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Conversion Rate</div>
          <div className="text-lg font-bold">{(analytics.conversionRate * 100).toFixed(1)}%</div>
        </div>
      </div>

      {/* Journey Steps */}
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />
        <div className="space-y-4">
          {steps.map((step) => (
            <div key={step.id} className="relative flex items-start gap-4 pl-10">
              <div className={`absolute left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                step.status === "complete" ? "bg-green-500 border-green-500" :
                step.status === "in_progress" ? "bg-blue-500 border-blue-500" :
                "bg-background border-muted"
              }`}>
                {step.status === "complete" && <CheckCircle className="h-3 w-3 text-white" />}
                {step.status === "in_progress" && <div className="h-2 w-2 bg-white rounded-full" />}
              </div>
              <div className="flex-1 p-3 rounded-lg border bg-background">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{step.label}</div>
                    <div className="text-sm text-muted-foreground">{step.description}</div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    step.status === "complete" ? "bg-green-50 text-green-700" :
                    step.status === "in_progress" ? "bg-blue-50 text-blue-700" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {step.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 rounded-lg bg-blue-50 text-blue-700 text-sm">
        <div className="flex items-start gap-2">
          <ArrowRight className="h-4 w-4 mt-0.5" />
          <div>
            <div className="font-medium">Next Optimization</div>
            <div>Reduce friction between onboarding and activation by adding county pre-selection from signup context.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
