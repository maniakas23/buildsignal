import { useState } from "react";
import { Building2, Users, Globe, BarChart3, Shield, TrendingUp, AlertTriangle, CheckCircle, Layers } from "lucide-react";

export function EnterpriseOperationsPanel() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "teams", label: "Teams", icon: Users },
    { id: "security", label: "Security", icon: Shield },
    { id: "performance", label: "Performance", icon: TrendingUp },
  ];

  const metrics = {
    overview: [
      { label: "Active Users", value: "1,234", icon: Users },
      { label: "Counties Tracked", value: "3,142", icon: Globe },
      { label: "API Requests (24h)", value: "45.2K", icon: BarChart3 },
      { label: "Alert Response Rate", value: "94%", icon: AlertTriangle },
    ],
    teams: [
      { label: "Total Teams", value: "12", icon: Users },
      { label: "Active Members", value: "48", icon: Users },
      { label: "Pending Invites", value: "3", icon: Layers },
    ],
    security: [
      { label: "SSO Enabled", value: "Yes", icon: Shield, status: "good" },
      { label: "2FA Adoption", value: "87%", icon: CheckCircle, status: "good" },
      { label: "Last Audit", value: "2024-01-15", icon: Shield, status: "good" },
    ],
    performance: [
      { label: "Avg API Latency", value: "45ms", icon: TrendingUp },
      { label: "Uptime", value: "99.9%", icon: CheckCircle },
      { label: "Error Rate", value: "0.1%", icon: AlertTriangle },
    ],
  };

  const currentMetrics = metrics[activeTab as keyof typeof metrics] || [];

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-6">
        <Building2 className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Enterprise Operations</h3>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm ${
              activeTab === tab.id ? "bg-primary text-primary-foreground" : "border border-input hover:bg-accent"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentMetrics.map((metric) => (
          <div key={metric.label} className="p-4 rounded-lg bg-accent">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{metric.label}</span>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className={`text-2xl font-bold ${
              (metric as any).status === "good" ? "text-green-500" : ""
            }`}>
              {metric.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
