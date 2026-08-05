import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, ArrowRight, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const insights = [
  { title: "Residential permits up 23% nationally", trend: "up", detail: "Driven by suburban migration and low interest rates", confidence: 91 },
  { title: "Commercial activity cooling in Q3", trend: "down", detail: "Office construction declining as remote work persists", confidence: 84 },
  { title: "Industrial sector surging in Texas", trend: "up", detail: "Energy and logistics investments driving growth", confidence: 88 },
  { title: "Infrastructure spend increasing 15%", trend: "up", detail: "Federal stimulus funds reaching local projects", confidence: 79 },
];

export function MarketInsightsPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Market Insights</h1><p className="text-muted-foreground">AI-generated market intelligence</p></div>
        <Button onClick={() => navigate("/growth-signals")} className="gap-2">Growth Signals <ArrowRight className="h-4 w-4"/></Button>
      </div>

      <div className="space-y-2">
        {insights.map((insight, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {insight.trend === "up" ? <TrendingUp className="h-5 w-5 text-green-500 mt-0.5"/> : <TrendingDown className="h-5 w-5 text-red-500 mt-0.5"/>}
                  <div>
                    <div className="font-medium">{insight.title}</div>
                    <div className="text-sm text-muted-foreground">{insight.detail}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{insight.confidence}% confidence</Badge>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
