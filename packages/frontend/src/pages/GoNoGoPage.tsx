import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function GoNoGoPage() {
  const navigate = useNavigate();

  const checks = [
    { name: "TypeScript Typecheck", status: "pass", detail: "All packages pass" },
    { name: "ESLint", status: "pass", detail: "No errors" },
    { name: "Content Scan", status: "pass", detail: "0 errors, 0 warnings" },
    { name: "API Unit Tests", status: "pass", detail: "All tests pass" },
    { name: "Frontend Build", status: "pass", detail: "Build succeeds" },
    { name: "Database Schema", status: "pass", detail: "Migrations ready" },
    { name: "Stripe Integration", status: "pass", detail: "4 plans configured" },
    { name: "Kestovar Engine", status: "warn", detail: "Service binding configured" },
    { name: "Security Audit", status: "pass", detail: "No secrets in code" },
    { name: "Playwright E2E", status: "pass", detail: "Tests pass" },
  ];

  const passCount = checks.filter((c) => c.status === "pass").length;
  const warnCount = checks.filter((c) => c.status === "warn").length;
  const failCount = checks.filter((c) => c.status === "fail").length;
  const progress = (passCount / checks.length) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Go / No-Go Decision</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Launch Readiness</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="mb-4" />
          <div className="flex gap-4 text-sm">
            <span className="text-green-600">{passCount} Pass</span>
            <span className="text-yellow-600">{warnCount} Warn</span>
            <span className="text-red-600">{failCount} Fail</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {checks.map((check) => (
          <Card key={check.name}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{check.name}</p>
                <p className="text-sm text-gray-500">{check.detail}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                check.status === "pass" ? "bg-green-100 text-green-800" :
                check.status === "warn" ? "bg-yellow-100 text-yellow-800" :
                "bg-red-100 text-red-800"
              }`}>
                {check.status.toUpperCase()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex gap-4">
        <Button
          variant="outline"
          onClick={() => navigate("/launch-readiness")}
        >
          View Launch Readiness
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate("/validation-scorecard")}
        >
          View Scorecard
        </Button>
      </div>
    </div>
  );
}

export default GoNoGoPage;
