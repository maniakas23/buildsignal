import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CheckItem { label: string; status: "pass" | "warn" | "fail"; category: string; }

export function RCValidationPage() {
  const navigate = useNavigate();

  const checks: CheckItem[] = [
    { label: "API contract validation", status: "pass", category: "API" },
    { label: "Schema backward compatibility", status: "pass", category: "API" },
    { label: "Stripe payment flows", status: "pass", category: "Billing" },
    { label: "Subscription lifecycle", status: "pass", category: "Billing" },
    { label: "Kimi OAuth login", status: "pass", category: "Auth" },
    { label: "Enterprise SSO", status: "warn", category: "Auth" },
    { label: "Kestovar engine health", status: "pass", category: "Engine" },
    { label: "Event ingestion", status: "pass", category: "Engine" },
    { label: "Unit test coverage", status: "pass", category: "Testing" },
    { label: "E2E test suite", status: "warn", category: "Testing" },
  ];

  const passed = checks.filter((c) => c.status === "pass").length;
  const total = checks.length;

  const statusIcon = { pass: <CheckCircle2 className="h-5 w-5 text-green-500" />, warn: <AlertTriangle className="h-5 w-5 text-yellow-500" />, fail: <XCircle className="h-5 w-5 text-red-500" /> };

  const categories = [...new Set(checks.map((c) => c.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">RC Validation</h1><p className="text-muted-foreground">Release candidate validation suite</p></div>
        <Button onClick={() => navigate("/rc-platform")} className="gap-2">RC Platform <ArrowRight className="h-4 w-4"/></Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><div className="text-3xl font-bold">{passed}/{total}</div><div className="text-sm text-muted-foreground">Validation passed</div></div>
            <Badge variant={passed === total ? "default" : "secondary"}>{passed === total ? "VALIDATED" : "NEEDS REVIEW"}</Badge>
          </div>
        </CardContent>
      </Card>

      {categories.map((category) => (
        <Card key={category}>
          <CardHeader><CardTitle>{category}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {checks.filter((c) => c.category === category).map((check) => (
                <div key={check.label} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">{statusIcon[check.status]}<span className="font-medium">{check.label}</span></div>
                  <Badge variant={check.status === "pass" ? "default" : check.status === "warn" ? "secondary" : "destructive"} className="capitalize">{check.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
