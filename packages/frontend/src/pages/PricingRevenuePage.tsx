import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, DollarSign, TrendingUp, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function PricingRevenuePage() {
  const navigate = useNavigate();

  const tiers = [
    { name: "Starter", price: 49, mrr: 12400, subs: 248, churn: 2.1 },
    { name: "Pro", price: 149, mrr: 35800, subs: 240, churn: 1.8 },
    { name: "Enterprise", price: 499, mrr: 49800, subs: 100, churn: 0.9 },
  ];

  const totalMrr = tiers.reduce((s, t) => s + t.mrr, 0);
  const totalSubs = tiers.reduce((s, t) => s + t.subs, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/pricing")} className="gap-2"><ArrowLeft className="h-4 w-4"/>Pricing</Button>
        <h1 className="text-2xl font-bold">Revenue Analytics</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-6"><div className="text-2xl font-bold">${(totalMrr / 1000).toFixed(1)}k</div><div className="text-sm text-muted-foreground">Monthly Recurring Revenue</div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="text-2xl font-bold">{totalSubs}</div><div className="text-sm text-muted-foreground">Active Subscriptions</div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="text-2xl font-bold">${(totalMrr / totalSubs).toFixed(0)}</div><div className="text-sm text-muted-foreground">Average Revenue Per User</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Revenue by Tier</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tiers.map((tier) => (
              <div key={tier.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">{tier.name}</div>
                    <div className="text-sm text-muted-foreground">${tier.price}/mo · {tier.subs} subscribers</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${tier.mrr.toLocaleString()}/mo</div>
                  <div className="text-sm text-muted-foreground">{tier.churn}% churn</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button onClick={() => navigate("/pricing")} className="gap-2">Pricing Page <ArrowRight className="h-4 w-4"/></Button>
    </div>
  );
}
