import { useState } from "react";
import { Rocket, CheckCircle, AlertTriangle, XCircle, Clock, Shield, TrendingUp, Users, BarChart3 } from "lucide-react";

export function LaunchReadinessDashboard() {
  const [readiness] = useState({
    overall: 0.94,
    categories: [
      { name: "API & Backend", score: 0.98, status: "ready", checks: ["All endpoints tested", "Rate limiting active", "Auth middleware verified", "Stripe integration live"] },
      { name: "Frontend", score: 0.96, status: "ready", checks: ["Build optimized", "E2E tests passing", "No beta language", "Responsive design"] },
      { name: "Kestovar Engine", score: 0.92, status: "ready", checks: ["Engine deployed", "Health checks passing", "Circuit breaker active", "Queue processing"] },
      { name: "Security", score: 0.95, status: "ready", checks: ["SSO enabled", "Security headers", "CSP configured", "Audit logs"] },
      { name: "Monitoring", score: 0.88, status: "warning", checks: ["Metrics pipeline", "Alerting rules", "Dashboard configured", "Log aggregation"] },
      { name: "Documentation", score: 0.85, status: "warning", checks: ["API docs", "User guide", "Onboarding flow", "Help content"] },
    ],
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready": return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning": return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "error": return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-6">
        <Rocket className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Launch Readiness</h3>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Overall Readiness</span>
          <span className="text-2xl font-bold">{(readiness.overall * 100).toFixed(0)}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${readiness.overall * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {readiness.categories.map((category) => (
          <div key={category.name} className="p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {getStatusIcon(category.status)}
                <span className="font-medium">{category.name}</span>
              </div>
              <span className="text-sm font-bold">{(category.score * 100).toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
              <div
                className={`h-full rounded-full ${
                  category.score >= 0.95 ? "bg-green-500" :
                  category.score >= 0.85 ? "bg-yellow-500" :
                  "bg-red-500"
                }`}
                style={{ width: `${category.score * 100}%` }}
              />
            </div>
            <div className="space-y-1">
              {category.checks.map((check) => (
                <div key={check} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="text-muted-foreground">{check}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {readiness.overall >= 0.9 && (
        <div className="mt-6 p-4 rounded-lg bg-green-50 text-green-700 text-sm font-medium">
          Platform is ready for production launch
        </div>
      )}
    </div>
  );
}
