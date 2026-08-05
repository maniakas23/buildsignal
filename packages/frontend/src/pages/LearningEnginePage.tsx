import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, RefreshCw, TrendingUp, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function LearningEnginePage() {
  const navigate = useNavigate();

  const features = [
    { title: "Feedback Loop", description: "User feedback improves model accuracy", status: "Active", accuracy: "+12%" },
    { title: "Pattern Learning", description: "New patterns detected automatically", status: "Active", accuracy: "+8%" },
    { title: "Anomaly Adaptation", description: "Models adapt to unusual market conditions", status: "Beta", accuracy: "+5%" },
    { title: "Recommendation Tuning", description: "Recommendations personalized per user", status: "Active", accuracy: "+15%" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">AI Learning Engine</h1><p className="text-muted-foreground">Continuous learning and model improvement</p></div>
        <Button onClick={() => navigate("/ai-os")} className="gap-2">AI OS <ArrowRight className="h-4 w-4"/></Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><Brain className="h-5 w-5 text-primary"/>{feature.title}</CardTitle>
                <Badge variant={feature.status === "Active" ? "default" : "secondary"}>{feature.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">{feature.description}</p>
              <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-500"/><span className="text-sm font-medium">{feature.accuracy} improvement</span></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><RefreshCw className="h-5 w-5"/>Training Pipeline</CardTitle></CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Models are retrained weekly with new permit data, user feedback, and validated predictions. The pipeline includes data validation, feature engineering, model training, and A/B testing before deployment.</div>
        </CardContent>
      </Card>
    </div>
  );
}
