import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const summary = [
  { label: "Active Opportunities", value: 42, change: 8, trend: "up" },
  { label: "New Permits (24h)", value: 1247, change: 15, trend: "up" },
  { label: "Alert Count", value: 3, change: -1, trend: "down" },
  { label: "AI Accuracy", value: "87%", change: 2, trend: "up" },
];

export function SummaryPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Summary</h1><p className="text-muted-foreground">Executive overview</p></div>
        <Button onClick={() => navigate("/dashboard")} className="gap-2">Dashboard <ArrowRight className="h-4 w-4"/></Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {summary.map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{item.label}</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{item.value}</div>
                <div className="flex items-center gap-1">
                  {item.trend === "up" ? <TrendingUp className="h-4 w-4 text-green-500" /> : item.trend === "down" ? <TrendingDown className="h-4 w-4 text-red-500" /> : <Minus className="h-4 w-4 text-muted-foreground" />}
                  <Badge variant={item.trend === "up" ? "default" : item.trend === "down" ? "destructive" : "secondary"} className="text-xs">{item.change > 0 ? "+" : ""}{item.change}%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5"/>Weekly Trend</CardTitle></CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Weekly permit volume and opportunity trends</div>
        </CardContent>
      </Card>
    </div>
  );
}
