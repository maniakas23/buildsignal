import { useState } from "react";
import { Heart, Activity, CheckCircle, AlertTriangle, TrendingUp, BarChart3 } from "lucide-react";

export function DeploymentHealth() {
  const [health] = useState({
    overall: "healthy",
    api: { status: "healthy", latency: 12, uptime: 99.9 },
    frontend: { status: "healthy", latency: 45, uptime: 99.8 },
    database: { status: "healthy", latency: 5, uptime: 99.99 },
    kestovar: { status: "healthy", latency: 67, uptime: 99.7 },
  });

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
        <h3 className="text-lg font-semibold">Deployment Health</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(health).filter(([key]) => key !== "overall").map(([key, value]) => (
          <div key={key} className="p-4 rounded-lg bg-accent">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon((value as any).status)}
                <span className="text-sm font-medium capitalize">{key}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                (value as any).status === "healthy" ? "bg-green-50 text-green-700" :
                (value as any).status === "degraded" ? "bg-yellow-50 text-yellow-700" :
                "bg-red-50 text-red-700"
              }`}>
                {(value as any).status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Latency</div>
                <div className="font-medium">{(value as any).latency}ms</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Uptime</div>
                <div className="font-medium">{(value as any).uptime}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
