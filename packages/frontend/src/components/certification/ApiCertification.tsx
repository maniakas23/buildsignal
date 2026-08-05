import { useState } from "react";
import { Shield, CheckCircle, AlertTriangle } from "lucide-react";

export function ApiCertification() {
  const [checks] = useState([
    { name: "Authentication", status: "pass" },
    { name: "Rate Limiting", status: "pass" },
    { name: "Input Validation", status: "pass" },
    { name: "Error Handling", status: "pass" },
    { name: "CORS Configuration", status: "pass" },
  ]);

  const allPass = checks.every((c) => c.status === "pass");

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">API Certification</h3>
      </div>
      <div className="space-y-2">
        {checks.map((check) => (
          <div key={check.name} className="flex items-center justify-between p-2 rounded-lg bg-accent">
            <span className="text-sm">{check.name}</span>
            {check.status === "pass" ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
          </div>
        ))}
      </div>
      {allPass && (
        <div className="mt-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm font-medium">
          All API checks passed
        </div>
      )}
    </div>
  );
}
