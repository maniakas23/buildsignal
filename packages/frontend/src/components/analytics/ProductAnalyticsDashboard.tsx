import { useState } from "react";
import { BarChart3, TrendingUp, Users } from "lucide-react";

export function ProductAnalyticsDashboard() {
  const [period, setPeriod] = useState("7d");

  const metrics = [
    { name: "Active Users", value: "1,234", change: "+12%", icon: Users },
    { name: "API Calls", value: "45.2K", change: "+8%", icon: BarChart3 },
    { name: "Conversion", value: "3.2%", change: "+0.5%", icon: TrendingUp },
  ];

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Product Analytics</h3>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-1 text-sm"
        >
          <option value="24h">24h</option>
          <option value="7d">7d</option>
          <option value="30d">30d</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div key={metric.name} className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{metric.name}</span>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold">{metric.value}</span>
              <span className="text-xs text-green-500">{metric.change}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
