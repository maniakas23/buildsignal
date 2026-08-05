import { useState } from "react";
import { Workflow, CheckCircle, XCircle } from "lucide-react";

export function ProductionWorkflowValidator() {
  const [checks] = useState([
    { name: "Build Pipeline", status: "pass" },
    { name: "Test Suite", status: "pass" },
    { name: "Security Scan", status: "pass" },
    { name: "Performance Audit", status: "pass" },
    { name: "Accessibility Audit", status: "pass" },
  ]);

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Workflow className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Production Workflow</h3>
      </div>
      <div className="space-y-2">
        {checks.map((check) => (
          <div key={check.name} className="flex items-center justify-between p-2 rounded-lg bg-accent">
            <span className="text-sm">{check.name}</span>
            {check.status === "pass" ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
