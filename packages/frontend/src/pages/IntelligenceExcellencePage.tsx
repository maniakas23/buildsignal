import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, TrendingUp, Shield, Brain, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function IntelligenceExcellencePage() {
  const navigate = useNavigate();

  const metrics = [
    { label: "Model Accuracy", value: "87.3%", icon: TrendingUp, trend: "up" },
    { label: "Data Coverage", value: "94.2%", icon: Shield, trend: "up" },
    { label: "Prediction Latency", value: "42ms", icon: Brain, trend: "down" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Intelligence Excellence</h1><p className="text-muted-foreground">Quality metrics and performance benchmarks</p></div>
        <Button onClick={() => navigate("/dashboard")} className="gap-2">Dashboard <ArrowRight className="h-4 w-4"/></Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                <metric.icon className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Award className="h-5 w-5"/>Excellence Program</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <p>BuildSignal&apos;s Intelligence Excellence program ensures our AI models meet the highest standards for accuracy, fairness, and reliability.</p>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="flex items-center gap-2"><Badge variant="default">MLOps</Badge><span className="text-muted-foreground">Continuous model training and validation</span></div>
              <div className="flex items-center gap-2"><Badge variant="default">Data Quality</Badge><span className="text-muted-foreground">Automated data pipeline validation</span></div>
              <div className="flex items-center gap-2"><Badge variant="default">Fairness</Badge><span className="text-muted-foreground">Bias detection and mitigation</span></div>
              <div className="flex items-center gap-2"><Badge variant="default">Explainability</Badge><span className="text-muted-foreground">Transparent AI decision making</span></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
