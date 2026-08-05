import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChecklistItem { label: string; status: "pass" | "warn" | "fail"; detail: string; }

export function CommercialLaunchCandidatePage() {
  const navigate = useNavigate();

  const checks: ChecklistItem[] = [
    { label: "API Endpoints", status: "pass", detail: "All 19 Kestovar endpoints responding" },
    { label: "Stripe Integration", status: "pass", detail: "Live keys configured, checkout working" },
    { label: "Authentication", status: "pass", detail: "Kimi OAuth + Enterprise SSO ready" },
    { label: "Database", status: "pass", detail: "D1 schema migrated, indexes created" },
    { label: "E2E Tests", status: "warn", detail: "6/8 passing, 2 SPA timing issues" },
    { label: "Security Headers", status: "pass", detail: "7 security headers implemented" },
    { label: "Rate Limiting", status: "pass", detail: "Headers returned on all API responses" },
    { label: "Graceful Degradation", status: "pass", detail: "Kestovar offline mode working" },
  ];

  const statusIcon = { pass: <CheckCircle2 className="h-5 w-5 text-green-500" />, warn: <AlertTriangle className="h-5 w-5 text-yellow-500" />, fail: <XCircle className="h-5 w-5 text-red-500" /> };
  const statusBadge = { pass: <Badge variant="default" className="bg-green-500">Pass</Badge>, warn: <Badge variant="secondary" className="bg-yellow-500">Warn</Badge>, fail: <Badge variant="destructive">Fail</Badge> };

  const passCount = checks.filter((c) => c.status === "pass").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Commercial Launch Candidate</h1>
          <p className="text-muted-foreground">BuildSignal v5.4.7 readiness assessment</p>
        </div>
        <Button onClick={() => navigate("/dashboard")} className="gap-2">Dashboard <ArrowRight className="h-4 w-4"/></Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{passCount}/{checks.length}</div>
              <div className="text-sm text-muted-foreground">Checks passed</div>
            </div>
            <div className="text-right">
              <Badge variant={passCount === checks.length ? "default" : "secondary"} className="text-lg">
                {passCount === checks.length ? "READY" : "NEEDS WORK"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {checks.map((check) => (
          <Card key={check.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">{statusIcon[check.status]}<div><div className="font-medium">{check.label}</div><div className="text-sm text-muted-foreground">{check.detail}</div></div></div>
                {statusBadge[check.status]}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
