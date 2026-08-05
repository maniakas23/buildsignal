import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const signals = [
  { county: "Maricopa, AZ", trend: "up", change: 45, metric: "Residential permits", confidence: 92 },
  { county: "Harris, TX", trend: "up", change: 23, metric: "Commercial permits", confidence: 88 },
  { county: "Miami-Dade, FL", trend: "down", change: -12, metric: "Overall permits", confidence: 76 },
  { county: "Denver, CO", trend: "up", change: 34, metric: "Industrial permits", confidence: 85 },
  { county: "Travis, TX", trend: "up", change: 18, metric: "Mixed-use permits", confidence: 81 },
];

export function GrowthSignalsPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Growth Signals</h1><p className="text-muted-foreground">AI-detected construction market trends</p></div>
        <Button onClick={() => navigate("/opportunities")} className="gap-2">View Opportunities <ArrowRight className="h-4 w-4"/></Button>
      </div>

      <div className="space-y-2">
        {signals.map((signal, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {signal.trend === "up" ? <TrendingUp className="h-5 w-5 text-green-500"/> : <TrendingDown className="h-5 w-5 text-red-500"/>}
                  <div>
                    <div className="font-medium">{signal.county}</div>
                    <div className="text-sm text-muted-foreground">{signal.metric}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`text-lg font-bold ${signal.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                    {signal.trend === "up" ? "+" : ""}{signal.change}%
                  </div>
                  <Badge variant="secondary">{signal.confidence}% confidence</Badge>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground"/>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
