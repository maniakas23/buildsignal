import { useState } from "react";
import { BarChart3, TrendingUp, Users, AlertTriangle, Calendar, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

export function ExecutiveDashboard() {
  const [period, setPeriod] = useState("7d");

  const kpis = [
    { label: "Total Revenue", value: "$1.2M", change: "+12%", trend: "up", icon: BarChart3 },
    { label: "Active Subscribers", value: "1,234", change: "+8%", trend: "up", icon: Users },
    { label: "Churn Rate", value: "2.1%", change: "-0.5%", trend: "down", icon: ArrowDownRight },
    { label: "Avg Revenue/User", value: "$89", change: "+3%", trend: "up", icon: TrendingUp },
  ];

  const alerts = [
    { id: 1, title: "Harris County surge detected", type: "opportunity", impact: "high" },
    { id: 2, title: "API latency spike", type: "technical", impact: "medium" },
    { id: 3, title: "Enterprise trial ending", type: "business", impact: "medium" },
  ];

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Executive Dashboard</h3>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-1 text-sm"
        >
          <option value="24h">24h</option>
          <option value="7d">7d</option>
          <option value="30d">30d</option>
          <option value="90d">90d</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="p-4 rounded-lg bg-accent">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{kpi.label}</span>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{kpi.value}</span>
              <span className={`text-xs ${
                kpi.trend === "up" ? "text-green-500" :
                kpi.trend === "down" ? "text-red-500" :
                "text-muted-foreground"
              }`}>
                {kpi.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h4 className="font-medium mb-3">Executive Alerts</h4>
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center gap-3 p-3 rounded-lg bg-accent">
              <AlertTriangle className={`h-4 w-4 ${
                alert.impact === "high" ? "text-red-500" :
                alert.impact === "medium" ? "text-yellow-500" :
                "text-blue-500"
              }`} />
              <div className="flex-1">
                <div className="text-sm font-medium">{alert.title}</div>
                <div className="text-xs text-muted-foreground">{alert.type}</div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                alert.impact === "high" ? "bg-red-50 text-red-700" :
                alert.impact === "medium" ? "bg-yellow-50 text-yellow-700" :
                "bg-blue-50 text-blue-700"
              }`}>
                {alert.impact}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
