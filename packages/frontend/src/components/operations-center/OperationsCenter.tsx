import { useState } from "react";
import { Activity, Server, Database, Shield, TrendingUp, AlertTriangle, CheckCircle, Clock, Zap, BarChart3, Users, Globe } from "lucide-react";

export function OperationsCenter() {
  const [systems] = useState([
    { name: "API Gateway", status: "healthy", uptime: "99.9%", latency: "12ms", requests: "12.4K/min" },
    { name: "Kestovar Engine", status: "healthy", uptime: "99.8%", latency: "45ms", requests: "8.9K/min" },
    { name: "Database", status: "healthy", uptime: "99.99%", latency: "5ms", requests: "45K/min" },
    { name: "Stripe Integration", status: "healthy", uptime: "99.9%", latency: "180ms", requests: "234/min" },
    { name: "Auth Service", status: "healthy", uptime: "99.9%", latency: "25ms", requests: "3.2K/min" },
  ]);

  const [metrics] = useState({
    totalRequests: 1245678,
    errorRate: 0.1,
    avgLatency: 34,
    activeUsers: 1234,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "degraded": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "down": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Operations Center</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-accent">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Requests</span>
          </div>
          <div className="text-2xl font-bold">{(metrics.totalRequests / 1000).toFixed(0)}K</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Error Rate</span>
          </div>
          <div className="text-2xl font-bold">{metrics.errorRate}%</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Avg Latency</span>
          </div>
          <div className="text-2xl font-bold">{metrics.avgLatency}ms</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Active Users</span>
          </div>
          <div className="text-2xl font-bold">{metrics.activeUsers}</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-muted-foreground mb-2">System Health</div>
        {systems.map((system) => (
          <div key={system.name} className="flex items-center justify-between p-3 rounded-lg bg-accent">
            <div className="flex items-center gap-3">
              {getStatusIcon(system.status)}
              <span className="text-sm font-medium">{system.name}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{system.uptime}</span>
              <span>{system.latency}</span>
              <span>{system.requests}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
