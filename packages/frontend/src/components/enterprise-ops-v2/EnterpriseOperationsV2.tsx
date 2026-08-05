import { useState } from "react";
import { Building2, Users, Globe, BarChart3, Shield, TrendingUp, AlertTriangle, CheckCircle, Activity } from "lucide-react";

export function EnterpriseOperationsV2() {
  const [selectedRegion, setSelectedRegion] = useState("all");

  const regions = [
    { id: "all", label: "All Regions" },
    { id: "southwest", label: "Southwest" },
    { id: "northeast", label: "Northeast" },
    { id: "midwest", label: "Midwest" },
  ];

  const metrics = [
    { label: "Active Users", value: "1,234", icon: Users, change: "+12%" },
    { label: "Counties Tracked", value: "3,142", icon: Globe, change: "+5%" },
    { label: "API Requests", value: "45.2K", icon: BarChart3, change: "+8%" },
    { label: "System Health", value: "99.9%", icon: Activity, change: "+0.1%" },
  ];

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Enterprise Operations V2</h3>
        </div>
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-1 text-sm"
        >
          {regions.map((region) => (
            <option key={region.id} value={region.id}>{region.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
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
    </div>
  );
}
