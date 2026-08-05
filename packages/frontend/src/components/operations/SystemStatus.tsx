import { useState } from "react";
import { Heart, Activity, CheckCircle, AlertTriangle, Server, Database, TrendingUp } from "lucide-react";

export function SystemStatus() {
  const [systems] = useState([
    { name: "API Gateway", status: "healthy", uptime: 99.9, latency: 12 },
    { name: "Kestovar Engine", status: "healthy", uptime: 99.8, latency: 45 },
    { name: "Database", status: "healthy", uptime: 99.99, latency: 5 },
    { name: "Stripe Integration", status: "healthy", uptime: 99.9, latency: 180 },
    { name: "Auth Service", status: "healthy", uptime: 99.9, latency: 25 },
  ]);

  const allHealthy = systems.every((s) => s.status === "healthy");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "degraded": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "down": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Heart className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">System Status</h3>
      </div>

      <div className="space-y-2">
        {systems.map((system) => (
          <div key={system.name} className="flex items-center justify-between p-3 rounded-lg bg-accent">
            <div className="flex items-center gap-3">
              {getStatusIcon(system.status)}
              <span className="text-sm font-medium">{system.name}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Uptime: {system.uptime}%</span>
              <span>Latency: {system.latency}ms</span>
              <span className={`px-2 py-1 rounded-full ${
                system.status === "healthy" ? "bg-green-50 text-green-700" :
                system.status === "degraded" ? "bg-yellow-50 text-yellow-700" :
                "bg-red-50 text-red-700"
              }`}>
                {system.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {allHealthy && (
        <div className="mt-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm font-medium">
          All systems operational
        </div>
      )}
    </div>
  );
}
