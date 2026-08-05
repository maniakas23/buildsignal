import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, TrendingUp, TrendingDown, Minus, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const portfolio = [
  { county: "Maricopa, AZ", position: "long", confidence: 87, change: 12, type: "Residential" },
  { county: "Harris, TX", position: "long", confidence: 82, change: 8, type: "Industrial" },
  { county: "Miami-Dade, FL", position: "neutral", confidence: 64, change: -2, type: "Commercial" },
  { county: "Denver, CO", position: "long", confidence: 74, change: 5, type: "Mixed-Use" },
  { county: "Travis, TX", position: "short", confidence: 45, change: -8, type: "Office" },
];

export function OpportunityPortfolioPage() {
  const navigate = useNavigate();

  const longs = portfolio.filter((p) => p.position === "long");
  const shorts = portfolio.filter((p) => p.position === "short");
  const total = longs.length + shorts.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Opportunity Portfolio</h1><p className="text-muted-foreground">Tracked opportunities and positions</p></div>
        <Button onClick={() => navigate("/opportunities")} className="gap-2">Browse <ArrowRight className="h-4 w-4"/></Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-6"><div className="text-2xl font-bold">{longs.length}</div><div className="text-sm text-muted-foreground">Long Positions</div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="text-2xl font-bold">{shorts.length}</div><div className="text-sm text-muted-foreground">Short Positions</div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="text-2xl font-bold">{total}</div><div className="text-sm text-muted-foreground">Total Tracked</div></CardContent></Card>
      </div>

      <div className="space-y-2">
        {portfolio.map((item) => (
          <Card key={item.county}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">{item.county}</div>
                    <div className="text-sm text-muted-foreground">{item.type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {item.change > 0 ? <TrendingUp className="h-4 w-4 text-green-500" /> : item.change < 0 ? <TrendingDown className="h-4 w-4 text-red-500" /> : <Minus className="h-4 w-4 text-muted-foreground" />}
                    <span className={`text-sm font-medium ${item.change > 0 ? "text-green-500" : item.change < 0 ? "text-red-500" : ""}`}>{item.change > 0 ? "+" : ""}{item.change}%</span>
                  </div>
                  <Badge variant={item.position === "long" ? "default" : item.position === "short" ? "destructive" : "secondary"} className="uppercase">{item.position}</Badge>
                  <div className="w-24"><div className="text-xs text-muted-foreground mb-1">{item.confidence}%</div><Progress value={item.confidence} className="h-2" /></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
