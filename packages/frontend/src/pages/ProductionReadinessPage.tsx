import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CheckItem { label: string; status: "pass" | "warn" | "fail"; }

export function ProductionReadinessPage() {
  const navigate = useNavigate();

  const checks: CheckItem[] = [
    { label: "API deployment", status: "pass" },
    { label: "Database migration", status: "pass" },
    { label: "Stripe integration", status: "pass" },
    { label: "Kestovar engine", status: "pass" },
    { label: "E2E test suite", status: "warn" },
    { label: "Monitoring alerts", status: "pass" },
    { label: "SSL certificates", status: "pass" },
    { label: "DNS configuration", status: "pass" },
  ];

  const passed = checks.filter((c) => c.status === "pass").length;
  const total = checks.length;
  const ready = passed === total;

  const statusIcon = { pass: <CheckCircle2 className="h-5 w-5 text-green-500" />, warn: <AlertTriangle className="h-5 w-5 text-yellow-500" />, fail: <XCircle className="h-5 w-5 text-red-500" /> };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Production Readiness</h1><p className="text-muted-foreground">Production deployment checklist</p></div>
        <Button onClick={() => navigate("/launch-readiness")} className="gap-2">Launch Readiness <ArrowRight className="h-4 w-4"/></Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><div className="text-3xl font-bold">{passed}/{total}</div><div className="text-sm text-muted-foreground">Checks passed</div></div>
            <Badge variant={ready ? "default" : "secondary"}>{ready ? "PRODUCTION READY" : "NEEDS WORK"}</Badge>
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
