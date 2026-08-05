import { useState } from "react";
import { DollarSign, TrendingUp, Users, BarChart3 } from "lucide-react";

export function RevenueOperationsDashboard() {
  const [metrics] = useState({
    mrr: 71882,
    arr: 862584,
    growth: 12,
    churn: 1.4,
    arpu: 89,
    ltv: 1240,
    cac: 180,
    nrr: 108,
  });

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-6">
        <DollarSign className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Revenue Operations</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">MRR</div>
          <div className="text-2xl font-bold">${metrics.mrr.toLocaleString()}</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">ARR</div>
          <div className="text-2xl font-bold">${metrics.arr.toLocaleString()}</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Growth</div>
          <div className="text-2xl font-bold text-green-500">+{metrics.growth}%</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Churn</div>
          <div className="text-2xl font-bold text-red-500">{metrics.churn}%</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">ARPU</div>
          <div className="text-2xl font-bold">${metrics.arpu}</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">LTV</div>
          <div className="text-2xl font-bold">${metrics.ltv.toLocaleString()}</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">CAC</div>
          <div className="text-2xl font-bold">${metrics.cac}</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">NRR</div>
          <div className="text-2xl font-bold text-green-500">{metrics.nrr}%</div>
        </div>
      </div>
    </div>
  );
}
