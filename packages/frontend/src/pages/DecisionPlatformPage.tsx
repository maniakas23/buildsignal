import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function DecisionPlatformPage() {
  const navigate = useNavigate();

  const features = [
    { title: "Opportunity Scoring", description: "AI-ranked opportunities by confidence and value", icon: TrendingUp, status: "Live" },
    { title: "Risk Assessment", description: "Identify potential risks before committing resources", icon: AlertTriangle, status: "Live" },
    { title: "ROI Calculator", description: "Project returns based on historical data patterns", icon: Brain, status: "Beta" },
    { title: "Decision Log", description: "Track and review past decisions for learning", icon: CheckCircle2, status: "Live" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Decision Intelligence Platform</h1><p className="text-muted-foreground">AI-powered tools for better construction decisions</p></div>
        <Button onClick={() => navigate("/opportunities")} className="gap-2">Explore Opportunities <ArrowRight className="h-4 w-4"/></Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><feature.icon className="h-5 w-5 text-primary"/>{feature.title}</CardTitle>
                <Badge variant={feature.status === "Live" ? "default" : "secondary"}>{feature.status}</Badge>
              </div>
            </CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{feature.description}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
