import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CheckItem { label: string; status: "pass" | "warn" | "fail"; }

export function LaunchReadinessPage() {
  const navigate = useNavigate();

  const checks: CheckItem[] = [
    { label: "API Health", status: "pass" },
    { label: "Database Schema", status: "pass" },
    { label: "Stripe Billing", status: "pass" },
    { label: "Authentication", status: "pass" },
    { label: "Kestovar Engine", status: "pass" },
    { label: "E2E Tests", status: "warn" },
    { label: "Security Audit", status: "pass" },
    { label: "Performance", status: "pass" },
  ];

  const passed = checks.filter((c) => c.status === "pass").length;
  const total = checks.length;
  const ready = passed === total;

  const statusIcon = { pass: <CheckCircle2 className="h-5 w-5 text-green-500" />, warn: <AlertTriangle className="h-5 w-5 text-yellow-500" />, fail: <XCircle className="h-5 w-5 text-red-500" /> };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Launch Readiness</h1><p className="text-muted-foreground">Pre-launch checklist for BuildSignal v5.4.7</p></div>
        <Button onClick={() => navigate("/commercial-launch")} className="gap-2">Launch Candidate <ArrowRight className="h-4 w-4"/></Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><div className="text-3xl font-bold">{passed}/{total}</div><div className="text-sm text-muted-foreground">Checks passed</div></div>
            <Badge variant={ready ? "default" : "secondary"} className="text-lg">{ready ? "READY" : "NEEDS WORK"}</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {checks.map((check) => (
          <Card key={check.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">{statusIcon[check.status]}<span className="font-medium">{check.label}</span></div>
                <Badge variant={check.status === "pass" ? "default" : check.status === "warn" ? "secondary" : "destructive"} className="capitalize">{check.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
