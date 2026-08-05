import { useState } from "react";
import { Heart, Activity, CheckCircle, AlertTriangle, Server, Database, TrendingUp, Globe } from "lucide-react";

export function ProviderHealthMonitor() {
  const [providers] = useState([
    { name: "Kestovar Engine", status: "healthy", uptime: 99.8, latency: 45, lastCheck: "2 min ago" },
    { name: "Stripe API", status: "healthy", uptime: 99.9, latency: 180, lastCheck: "5 min ago" },
    { name: "Kimi OAuth", status: "healthy", uptime: 99.9, latency: 25, lastCheck: "3 min ago" },
    { name: "D1 Database", status: "healthy", uptime: 99.99, latency: 5, lastCheck: "1 min ago" },
  ]);

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
        <h3 className="text-lg font-semibold">Provider Health</h3>
      </div>

      <div className="space-y-2">
        {providers.map((provider) => (
          <div key={provider.name} className="flex items-center justify-between p-3 rounded-lg bg-accent">
            <div className="flex items-center gap-3">
              {getStatusIcon(provider.status)}
              <span className="text-sm font-medium">{provider.name}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{provider.uptime}% uptime</span>
              <span>{provider.latency}ms</span>
              <span>{provider.lastCheck}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
