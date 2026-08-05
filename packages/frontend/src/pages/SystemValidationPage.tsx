import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const checks = [
  { label: "Build compilation", status: "pass" },
  { label: "TypeScript type checking", status: "pass" },
  { label: "Linting (ESLint)", status: "pass" },
  { label: "Unit tests (Vitest)", status: "pass" },
  { label: "E2E tests (Playwright)", status: "warn" },
  { label: "Bundle size audit", status: "pass" },
  { label: "Dependency audit", status: "pass" },
  { label: "Accessibility scan", status: "pass" },
];

export function SystemValidationPage() {
  const navigate = useNavigate();
  const passed = checks.filter((c) => c.status === "pass").length;
  const total = checks.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">System Validation</h1><p className="text-muted-foreground">Build and test validation</p></div>
        <Button onClick={() => navigate("/production-readiness")} className="gap-2">Production <ArrowRight className="h-4 w-4"/></Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><div className="text-3xl font-bold">{passed}/{total}</div><div className="text-sm text-muted-foreground">Checks passed</div></div>
            <Badge variant={passed === total ? "default" : "secondary"}>{passed === total ? "VALID" : "REVIEW"}</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {checks.map((check) => (
          <Card key={check.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {check.status === "pass" ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                  <span className="font-medium">{check.label}</span>
                </div>
                <Badge variant={check.status === "pass" ? "default" : "secondary"} className="capitalize">{check.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
