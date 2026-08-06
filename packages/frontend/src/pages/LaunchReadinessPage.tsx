import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function LaunchReadinessPage() {
  const navigate = useNavigate();

  const sections = [
    {
      title: "Security & Compliance",
      items: [
        { name: "TLS 1.3", status: "pass" },
        { name: "RBAC", status: "pass" },
        { name: "Audit Logging", status: "pass" },
        { name: "GDPR", status: "fail" },
        { name: "SOC 2", status: "fail" },
      ],
    },
    {
      title: "Infrastructure",
      items: [
        { name: "Cloudflare Edge", status: "pass" },
        { name: "D1 Database", status: "pass" },
        { name: "R2 Storage", status: "pass" },
        { name: "Queues", status: "pass" },
        { name: "Cron Triggers", status: "pass" },
      ],
    },
    {
      title: "Features",
      items: [
        { name: "Authentication", status: "pass" },
        { name: "Billing", status: "pass" },
        { name: "Maps", status: "pass" },
        { name: "Watchlists", status: "pass" },
        { name: "Notifications", status: "pass" },
      ],
    },
    {
      title: "Integrations",
      items: [
        { name: "Stripe", status: "pass" },
        { name: "Kimi OAuth", status: "pass" },
        { name: "Kestovar Engine", status: "warn" },
        { name: "Webhook API", status: "pass" },
        { name: "Export (CSV/JSON)", status: "pass" },
      ],
    },
  ];

  const totalItems = sections.reduce((acc, s) => acc + s.items.length, 0);
  const passCount = sections.reduce((acc, s) => acc + s.items.filter((i) => i.status === "pass").length, 0);
  const warnCount = sections.reduce((acc, s) => acc + s.items.filter((i) => i.status === "warn").length, 0);
  const failCount = sections.reduce((acc, s) => acc + s.items.filter((i) => i.status === "fail").length, 0);
  const progress = (passCount / totalItems) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Launch Readiness</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <span className="text-sm">{item.name}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      item.status === "pass" ? "bg-green-100 text-green-800" :
                      item.status === "warn" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex gap-4">
        <Button variant="outline" onClick={() => navigate("/go-no-go")}>
          Go/No-Go Decision
        </Button>
        <Button variant="outline" onClick={() => navigate("/validation-scorecard")}>
          Validation Scorecard
        </Button>
      </div>
    </div>
  );
}

export default LaunchReadinessPage;
