import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const milestones = [
  { title: "MVP Launch", date: "2023-01-15", status: "complete" },
  { title: "API v1", date: "2023-03-01", status: "complete" },
  { title: "Stripe Integration", date: "2023-04-15", status: "complete" },
  { title: "Kestovar Engine", date: "2023-06-01", status: "complete" },
  { title: "Enterprise SSO", date: "2023-08-01", status: "complete" },
  { title: "AI Platform v2", date: "2024-01-15", status: "complete" },
  { title: "Commercial Launch", date: "2024-03-01", status: "complete" },
  { title: "v5.4.7 Release", date: "2024-06-01", status: "in-progress" },
];

export function RCPlatformPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Release Candidate Platform</h1><p className="text-muted-foreground">Version milestone tracking</p></div>
        <Button onClick={() => navigate("/release-checklist")} className="gap-2">Checklist <ArrowRight className="h-4 w-4"/></Button>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
        <div className="space-y-6">
          {milestones.map((milestone, i) => (
            <div key={milestone.title} className="relative flex items-start gap-4 pl-10">
              <div className={`absolute left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center ${milestone.status === "complete" ? "bg-green-500 border-green-500" : "bg-background border-primary"}`}>
                {milestone.status === "complete" ? <CheckCircle2 className="h-3 w-3 text-white" /> : <Clock className="h-3 w-3 text-primary" />}
              </div>
              <Card className="flex-1">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div><div className="font-medium">{milestone.title}</div><div className="text-sm text-muted-foreground">{milestone.date}</div></div>
                    <Badge variant={milestone.status === "complete" ? "default" : "secondary"}>{milestone.status === "complete" ? "Complete" : "In Progress"}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
