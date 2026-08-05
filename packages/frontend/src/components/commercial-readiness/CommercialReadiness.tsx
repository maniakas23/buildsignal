import { useState } from "react";
import { Rocket, CheckCircle, AlertTriangle } from "lucide-react";

export function CommercialReadiness() {
  const [checks] = useState([
    { name: "Payment Integration", status: "ready" },
    { name: "User Authentication", status: "ready" },
    { name: "Data Pipeline", status: "ready" },
    { name: "Monitoring", status: "ready" },
    { name: "Support Channel", status: "ready" },
  ]);

  const allReady = checks.every((c) => c.status === "ready");

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Rocket className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Commercial Readiness</h3>
      </div>
      <div className="space-y-2">
        {checks.map((check) => (
          <div key={check.name} className="flex items-center justify-between p-2 rounded-lg bg-accent">
            <span className="text-sm">{check.name}</span>
            {check.status === "ready" ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            )}
          </div>
        ))}
      </div>
      {allReady && (
        <div className="mt-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm font-medium">
          Platform is commercially ready
        </div>
      )}
    </div>
  );
}
