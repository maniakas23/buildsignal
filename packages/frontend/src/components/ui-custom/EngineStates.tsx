import { useState } from "react";
import { Activity, Server, Database, Brain, TrendingUp, AlertTriangle, CheckCircle, Clock, Zap, Globe, Shield, CreditCard } from "lucide-react";

export function EngineStates() {
  const [engines] = useState([
    { name: "Kestovar Engine", status: "active", version: "v2.4.1", uptime: "99.8%", latency: 45, icon: Brain },
    { name: "API Gateway", status: "active", version: "v5.4.7", uptime: "99.9%", latency: 12, icon: Server },
    { name: "Auth Service", status: "active", version: "v3.2.0", uptime: "99.9%", latency: 25, icon: Shield },
    { name: "Billing Engine", status: "active", version: "v2.1.0", uptime: "99.9%", latency: 180, icon: CreditCard },
    { name: "Data Pipeline", status: "active", version: "v1.8.2", uptime: "99.7%", latency: 67, icon: Database },
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "degraded": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "down": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Engine States</h3>
      </div>

      <div className="space-y-2">
        {engines.map((engine) => (
          <div key={engine.name} className="flex items-center justify-between p-3 rounded-lg bg-accent">
            <div className="flex items-center gap-3">
              <engine.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{engine.name}</span>
              <span className="text-xs text-muted-foreground">{engine.version}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{engine.uptime}</span>
              <span>{engine.latency}ms</span>
              <div className="flex items-center gap-1">
                {getStatusIcon(engine.status)}
                <span className={`px-2 py-1 rounded-full ${
                  engine.status === "active" ? "bg-green-50 text-green-700" :
                  engine.status === "degraded" ? "bg-yellow-50 text-yellow-700" :
                  "bg-red-50 text-red-700"
                }`}>
                  {engine.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
