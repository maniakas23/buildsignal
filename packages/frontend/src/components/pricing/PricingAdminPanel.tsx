import { useState } from "react";
import { Settings, CreditCard, Users, BarChart3, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";

export function PricingAdminPanel() {
  const [plans] = useState([
    { id: "scout", name: "Scout", price: 99, subscribers: 145, mrr: 14355, churn: 2.1, growth: 12 },
    { id: "professional", name: "Professional", price: 249, subscribers: 89, mrr: 22161, churn: 1.8, growth: 8 },
    { id: "business", name: "Business", price: 599, subscribers: 34, mrr: 20366, churn: 1.2, growth: 15 },
    { id: "enterprise", name: "Enterprise", price: 0, subscribers: 12, mrr: 15000, churn: 0.5, growth: 20 },
  ]);

  const totalMrr = plans.reduce((sum, p) => sum + p.mrr, 0);
  const totalSubscribers = plans.reduce((sum, p) => sum + p.subscribers, 0);

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Pricing Admin</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Total MRR</div>
          <div className="text-2xl font-bold">${totalMrr.toLocaleString()}</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Subscribers</div>
          <div className="text-2xl font-bold">{totalSubscribers}</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Avg. Churn</div>
          <div className="text-2xl font-bold">1.4%</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium text-muted-foreground mb-2">Plan Performance</div>
        {plans.map((plan) => (
          <div key={plan.id} className="p-4 rounded-lg bg-accent">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">{plan.name}</div>
              <div className="text-sm font-medium">${plan.price > 0 ? `${plan.price}/mo` : "Custom"}</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Subscribers</div>
                <div className="font-medium">{plan.subscribers}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">MRR</div>
                <div className="font-medium">${plan.mrr.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Churn</div>
                <div className={`font-medium ${plan.churn < 1.5 ? "text-green-500" : "text-yellow-500"}`}>
                  {plan.churn}%
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Growth</div>
                <div className="font-medium text-green-500">+{plan.growth}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
