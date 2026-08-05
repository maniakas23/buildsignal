import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const phases = [
  {
    name: "Pre-Launch",
    items: [
      { label: "Complete feature development", status: "complete" },
      { label: "API documentation published", status: "complete" },
      { label: "Pricing finalized", status: "complete" },
      { label: "Marketing materials ready", status: "complete" },
    ],
  },
  {
    name: "Launch Week",
    items: [
      { label: "Deploy production build", status: "complete" },
      { label: "Enable billing", status: "complete" },
      { label: "Send announcement email", status: "complete" },
      { label: "Monitor for issues", status: "complete" },
    ],
  },
  {
    name: "Post-Launch",
    items: [
      { label: "Collect user feedback", status: "in-progress" },
      { label: "Address critical issues", status: "complete" },
      { label: "Plan v5.5 roadmap", status: "in-progress" },
      { label: "Quarterly review", status: "pending" },
    ],
  },
];

export function ReadinessChecklistPage() {
  const navigate = useNavigate();

  const allItems = phases.flatMap((p) => p.items);
  const completed = allItems.filter((i) => i.status === "complete").length;
  const total = allItems.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Readiness Checklist</h1><p className="text-muted-foreground">Launch phase checklist</p></div>
        <Button onClick={() => navigate("/launch-readiness")} className="gap-2">Launch Readiness <ArrowRight className="h-4 w-4"/></Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><div className="text-3xl font-bold">{completed}/{total}</div><div className="text-sm text-muted-foreground">Items completed</div></div>
            <Badge variant={completed === total ? "default" : "secondary"}>{completed === total ? "READY" : "IN PROGRESS"}</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {phases.map((phase) => (
          <Card key={phase.name}>
            <CardHeader><CardTitle>{phase.name}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {phase.items.map((item) => (
                  <div key={item.label} className="flex items-center gap-3 p-2">
                    {item.status === "complete" ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : item.status === "in-progress" ? <AlertTriangle className="h-5 w-5 text-yellow-500" /> : <div className="h-5 w-5 rounded-full border-2 border-muted" />}
                    <span className={item.status === "complete" ? "line-through text-muted-foreground" : ""}>{item.label}</span>
                    <Badge variant={item.status === "complete" ? "default" : item.status === "in-progress" ? "secondary" : "outline"} className="ml-auto capitalize">{item.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
