import { useState } from "react";
import { Award, CheckCircle, AlertTriangle } from "lucide-react";

export function ReleaseCandidateCertification() {
  const [certification] = useState({
    version: "5.4.7",
    build: 108,
    status: "certified",
    checks: [
      { name: "Type Check", status: "pass" },
      { name: "Unit Tests", status: "pass" },
      { name: "E2E Tests", status: "pass" },
      { name: "Security Audit", status: "pass" },
      { name: "Performance Check", status: "pass" },
    ],
  });

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Award className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Release Certification</h3>
      </div>
      <div className="mb-4">
        <div className="text-sm text-muted-foreground">Version</div>
        <div className="text-lg font-bold">{certification.version} (Build {certification.build})</div>
      </div>
      <div className="space-y-2">
        {certification.checks.map((check) => (
          <div key={check.name} className="flex items-center justify-between p-2 rounded-lg bg-accent">
            <span className="text-sm">{check.name}</span>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm font-medium">
        Release candidate certified for production
      </div>
    </div>
  );
}
