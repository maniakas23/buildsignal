import { useState } from "react";
import { Pipeline, CheckCircle, XCircle, AlertTriangle, Activity, Clock, BarChart3 } from "lucide-react";

export function ProviderPipelineAudit() {
  const [pipelines] = useState([
    { name: "Data Ingestion", status: "pass", steps: 5, passed: 5, failed: 0, duration: "2.3s" },
    { name: "Pattern Analysis", status: "pass", steps: 8, passed: 8, failed: 0, duration: "4.1s" },
    { name: "Signal Detection", status: "pass", steps: 6, passed: 6, failed: 0, duration: "3.2s" },
    { name: "Alert Generation", status: "pass", steps: 4, passed: 4, failed: 0, duration: "1.8s" },
    { name: "Knowledge Update", status: "pass", steps: 7, passed: 7, failed: 0, duration: "5.6s" },
  ]);

  const allPass = pipelines.every((p) => p.status === "pass");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "fail": return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Pipeline className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Pipeline Audit</h3>
      </div>

      <div className="space-y-2">
        {pipelines.map((pipeline) => (
          <div key={pipeline.name} className="flex items-center justify-between p-3 rounded-lg bg-accent">
            <div className="flex items-center gap-3">
              {getStatusIcon(pipeline.status)}
              <span className="text-sm font-medium">{pipeline.name}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{pipeline.passed}/{pipeline.steps} steps</span>
              <span>{pipeline.duration}</span>
              <span className={`px-2 py-1 rounded-full ${
                pipeline.status === "pass" ? "bg-green-50 text-green-700" :
                pipeline.status === "fail" ? "bg-red-50 text-red-700" :
                "bg-yellow-50 text-yellow-700"
              }`}>
                {pipeline.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {allPass && (
        <div className="mt-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm font-medium">
          All pipeline checks passed
        </div>
      )}
    </div>
  );
}
