import { useState } from "react";
import { Command, Activity, TrendingUp, AlertTriangle, Users, Globe, BarChart3, Zap } from "lucide-react";

export function ExecutiveCommandCenter() {
  const [activeView, setActiveView] = useState("overview");

  const views = [
    { id: "overview", label: "Overview", icon: Command },
    { id: "performance", label: "Performance", icon: TrendingUp },
    { id: "alerts", label: "Alerts", icon: AlertTriangle },
    { id: "teams", label: "Teams", icon: Users },
  ];

  const overviewMetrics = [
    { label: "Revenue (MTD)", value: "$124.5K", change: "+12%", icon: BarChart3 },
    { label: "Active Users", value: "1,234", change: "+8%", icon: Users },
    { label: "API Calls", value: "45.2K", change: "+15%", icon: Zap },
    { label: "Uptime", value: "99.9%", change: "+0.1%", icon: Activity },
  ];

  const alerts = [
    { id: 1, title: "Harris County permit surge", severity: "high", time: "5 min ago" },
    { id: 2, title: "Maricopa County trend change", severity: "medium", time: "1 hour ago" },
    { id: 3, title: "API latency spike", severity: "low", time: "3 hours ago" },
  ];

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-6">
        <Command className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Executive Command Center</h3>
      </div>

      <div className="flex gap-2 mb-6">
        {views.map((view) => (
          <button
            key={view.id}
            onClick={() => setActiveView(view.id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm ${
              activeView === view.id ? "bg-primary text-primary-foreground" : "border border-input hover:bg-accent"
            }`}
          >
            <view.icon className="h-4 w-4" />
            {view.label}
          </button>
        ))}
      </div>

      {activeView === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {overviewMetrics.map((metric) => (
            <div key={metric.label} className="p-4 rounded-lg bg-accent">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{metric.label}</span>
                <metric.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{metric.value}</span>
                <span className="text-xs text-green-500">{metric.change}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeView === "alerts" && (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center gap-3 p-3 rounded-lg bg-accent">
              <AlertTriangle className={`h-4 w-4 ${
                alert.severity === "high" ? "text-red-500" :
                alert.severity === "medium" ? "text-yellow-500" :
                "text-blue-500"
              }`} />
              <div className="flex-1">
                <div className="text-sm font-medium">{alert.title}</div>
                <div className="text-xs text-muted-foreground">{alert.time}</div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                alert.severity === "high" ? "bg-red-50 text-red-700" :
                alert.severity === "medium" ? "bg-yellow-50 text-yellow-700" :
                "bg-blue-50 text-blue-700"
              }`}>
                {alert.severity}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeView === "performance" && (
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground mb-2">Performance metrics coming soon</div>
        </div>
      )}

      {activeView === "teams" && (
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground mb-2">Team management coming soon</div>
        </div>
      )}
    </div>
  );
}
