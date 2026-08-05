import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const items = [
  { label: "Feature freeze", status: "complete" },
  { label: "Code review complete", status: "complete" },
  { label: "Security audit passed", status: "complete" },
  { label: "Performance benchmarks met", status: "complete" },
  { label: "Documentation updated", status: "complete" },
  { label: "Marketing site ready", status: "complete" },
  { label: "Support processes in place", status: "complete" },
  { label: "Rollback plan documented", status: "complete" },
  { label: "Analytics dashboard ready", status: "warn" },
  { label: "Customer onboarding flow", status: "complete" },
];

export function ReleaseChecklistPage() {
  const navigate = useNavigate();
  const completed = items.filter((i) => i.status === "complete").length;
  const total = items.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Release Checklist</h1><p className="text-muted-foreground">v5.4.7 release checklist</p></div>
        <Button onClick={() => navigate("/rc-platform")} className="gap-2">RC Platform <ArrowRight className="h-4 w-4"/></Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><div className="text-3xl font-bold">{completed}/{total}</div><div className="text-sm text-muted-foreground">Items complete</div></div>
            <Badge variant={completed === total ? "default" : "secondary"}>{completed === total ? "READY" : "IN PROGRESS"}</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {items.map((item) => (
          <Card key={item.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {item.status === "complete" ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                  <span className={item.status === "complete" ? "line-through text-muted-foreground" : "font-medium"}>{item.label}</span>
                </div>
                <Badge variant={item.status === "complete" ? "default" : "secondary"} className="capitalize">{item.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
