import { useState } from "react";
import { Shield, CheckCircle, AlertTriangle, BarChart3, TrendingUp, TrendingDown, Minus } from "lucide-react";

export function IntelligenceQualityValidator() {
  const [validators] = useState([
    { name: "Permit Data Validator", status: "pass", accuracy: 98.2, coverage: 99.1, latency: 45 },
    { name: "Growth Rate Validator", status: "pass", accuracy: 96.5, coverage: 97.8, latency: 120 },
    { name: "Signal Score Validator", status: "pass", accuracy: 94.8, coverage: 96.2, latency: 200 },
    { name: "Alert Precision Validator", status: "warning", accuracy: 89.5, coverage: 94.3, latency: 350 },
  ]);

  const allPass = validators.every((v) => v.status === "pass");
  const avgAccuracy = validators.reduce((sum, v) => sum + v.accuracy, 0) / validators.length;

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Quality Validator</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Validators</div>
          <div className="text-2xl font-bold">{validators.length}</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Avg Accuracy</div>
          <div className="text-2xl font-bold">{avgAccuracy.toFixed(1)}%</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Status</div>
          <div className={`text-2xl font-bold ${allPass ? "text-green-500" : "text-yellow-500"}`}>
            {allPass ? "Passing" : "Warning"}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {validators.map((validator) => (
          <div key={validator.name} className="p-3 rounded-lg bg-accent">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {validator.status === "pass" ? <CheckCircle className="h-4 w-4 text-green-500" /> :
                 validator.status === "warning" ? <AlertTriangle className="h-4 w-4 text-yellow-500" /> :
                 <AlertTriangle className="h-4 w-4 text-red-500" />}
                <span className="text-sm font-medium">{validator.name}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                validator.status === "pass" ? "bg-green-50 text-green-700" :
                validator.status === "warning" ? "bg-yellow-50 text-yellow-700" :
                "bg-red-50 text-red-700"
              }`}>
                {validator.status}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
              <div>Accuracy: {validator.accuracy}%</div>
              <div>Coverage: {validator.coverage}%</div>
              <div>Latency: {validator.latency}ms</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
