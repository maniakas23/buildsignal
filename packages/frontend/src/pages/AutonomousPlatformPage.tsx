import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cpu, Zap, Brain, Activity, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AutonomousPlatformPage() {
  const navigate = useNavigate();

  const features = [
    { title: "Pattern Recognition", description: "AI-powered pattern detection in permit data", icon: Brain, status: "Active" },
    { title: "Predictive Analytics", description: "Forecast building trends with ML models", icon: Activity, status: "Active" },
    { title: "Anomaly Detection", description: "Automatically detect unusual permit patterns", icon: Zap, status: "Active" },
    { title: "Auto-Classification", description: "Intelligent permit categorization", icon: Cpu, status: "Beta" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Autonomous Intelligence Platform</h1><p className="text-muted-foreground">Self-learning AI engine for construction intelligence</p></div>
        <Button onClick={() => navigate("/ai-os")} className="gap-2">Engine Status <ArrowRight className="h-4 w-4"/></Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><feature.icon className="h-5 w-5 text-primary"/>{feature.title}</CardTitle>
                <Badge variant={feature.status === "Active" ? "default" : "secondary"}>{feature.status}</Badge>
              </div>
            </CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{feature.description}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
