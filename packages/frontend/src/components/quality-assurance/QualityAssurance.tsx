import { useState } from "react";
import { Shield, CheckCircle, AlertTriangle, XCircle, BarChart3, TrendingUp, Activity } from "lucide-react";

export function QualityAssurance() {
  const [checks] = useState([
    { name: "Data Accuracy", status: "pass", score: 98.5, threshold: 95 },
    { name: "Recommendation Quality", status: "pass", score: 94.2, threshold: 90 },
    { name: "Alert Precision", status: "pass", score: 96.8, threshold: 95 },
    { name: "System Performance", status: "pass", score: 99.1, threshold: 99 },
    { name: "API Reliability", status: "pass", score: 99.9, threshold: 99 },
  ]);

  const allPass = checks.every((c) => c.status === "pass");
  const avgScore = checks.reduce((sum, c) => sum + c.score, 0) / checks.length;

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Quality Assurance</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Checks Passed</div>
          <div className="text-2xl font-bold">{checks.filter((c) => c.status === "pass").length}/{checks.length}</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Average Score</div>
          <div className="text-2xl font-bold">{avgScore.toFixed(1)}%</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Status</div>
          <div className={`text-2xl font-bold ${allPass ? "text-green-500" : "text-red-500"}`}>
            {allPass ? "Passing" : "Failing"}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {checks.map((check) => (
          <div key={check.name} className="p-3 rounded-lg bg-accent">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {check.status === "pass" ? <CheckCircle className="h-4 w-4 text-green-500" /> :
                 check.status === "fail" ? <XCircle className="h-4 w-4 text-red-500" /> :
                 <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                <span className="text-sm font-medium">{check.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Threshold: {check.threshold}%</span>
                <span className={`text-sm font-bold ${check.score >= check.threshold ? "text-green-500" : "text-red-500"}`}>
                  {check.score}%
                </span>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${check.score >= check.threshold ? "bg-green-500" : "bg-red-500"}`}
                style={{ width: `${check.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
