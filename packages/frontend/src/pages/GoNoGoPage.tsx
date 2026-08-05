import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface GoNoGoItem { id: string; factor: string; status: "go" | "no-go" | "caution"; weight: number; }

export function GoNoGoPage() {
  const navigate = useNavigate();
  const [items] = useState<GoNoGoItem[]>([
    { id: "1", factor: "Market Demand", status: "go", weight: 25 },
    { id: "2", factor: "Permit Volume", status: "go", weight: 20 },
    { id: "3", factor: "Competition", status: "caution", weight: 15 },
    { id: "4", factor: "Seasonal Timing", status: "go", weight: 10 },
    { id: "5", factor: "Resource Availability", status: "caution", weight: 15 },
    { id: "6", factor: "Regulatory Risk", status: "go", weight: 15 },
  ]);

  const goScore = items.filter((i) => i.status === "go").reduce((sum, i) => sum + i.weight, 0);
  const cautionScore = items.filter((i) => i.status === "caution").reduce((sum, i) => sum + i.weight, 0);
  const noGoScore = items.filter((i) => i.status === "no-go").reduce((sum, i) => sum + i.weight, 0);

  const recommendation = goScore > 70 ? "GO" : goScore > 50 ? "CAUTION" : "NO-GO";

  const statusIcon = { go: <CheckCircle2 className="h-5 w-5 text-green-500" />, "no-go": <XCircle className="h-5 w-5 text-red-500" />, caution: <AlertTriangle className="h-5 w-5 text-yellow-500" /> };
  const statusBadge = { go: <Badge className="bg-green-500">GO</Badge>, "no-go": <Badge variant="destructive">NO-GO</Badge>, caution: <Badge className="bg-yellow-500">CAUTION</Badge> };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Go / No-Go Analysis</h1><p className="text-muted-foreground">Weighted decision framework for opportunities</p></div>
        <Button onClick={() => navigate("/opportunities")} className="gap-2">Opportunities <ArrowRight className="h-4 w-4"/></Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><div className="text-3xl font-bold">{goScore}%</div><div className="text-sm text-muted-foreground">Go Score</div></div>
            <div className="text-right"><div className="text-3xl font-bold">{recommendation}</div><div className="text-sm text-muted-foreground">Recommendation</div></div>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between"><span>Go factors</span><span>{goScore}%</span></div>
            <div className="flex items-center justify-between text-yellow-600"><span>Caution factors</span><span>{cautionScore}%</span></div>
            <div className="flex items-center justify-between text-red-600"><span>No-Go factors</span><span>{noGoScore}%</span></div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">{statusIcon[item.status]}<div><div className="font-medium">{item.factor}</div><div className="text-sm text-muted-foreground">Weight: {item.weight}%</div></div></div>
                {statusBadge[item.status]}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
