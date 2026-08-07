import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const scores = [
  { label: "API Reliability", score: 96, target: 95 },
  { label: "AI Accuracy", score: 87, target: 85 },
  { label: "Data Coverage", score: 94, target: 90 },
  { label: "Page Performance", score: 92, target: 90 },
  { label: "Accessibility", score: 88, target: 90 },
  { label: "Security Score", score: 98, target: 95 },
];

export function ValidationScorecardPage() {
  const navigate = useNavigate();
  const passed = scores.filter((s) => s.score >= s.target).length;
  const total = scores.length;
  const avg = Math.round(scores.reduce((sum, s) => sum + s.score, 0) / total);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Validation Scorecard</h1><p className="text-muted-foreground">Quality and performance metrics</p></div>
        <Button onClick={() => navigate("/system-validation")} className="gap-2">System Validation <ArrowRight className="h-4 w-4"/></Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{avg}%</div>
              <div className="text-sm text-muted-foreground">Average score</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{passed}/{total}</div>
              <div className="text-sm text-muted-foreground">Targets met</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {scores.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span className="font-medium">{s.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{s.score}%</span>
                  <Badge variant={s.score >= s.target ? "default" : "secondary"}>Target: {s.target}%</Badge>
                </div>
              </div>
              <Progress value={s.score} className="h-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
