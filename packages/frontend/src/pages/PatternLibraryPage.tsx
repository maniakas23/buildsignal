import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const patterns = [
  { name: "Surge Pattern", description: "Permit volume increases 40%+ over 3 months", type: "opportunity", usage: 1240 },
  { name: "Cooling Pattern", description: "Permit volume declines 20%+ over 2 quarters", type: "risk", usage: 890 },
  { name: "Seasonal Spike", description: "Predictable seasonal increase in residential permits", type: "seasonal", usage: 2100 },
  { name: "Infrastructure Lead", description: "Public infrastructure precedes commercial development", type: "predictive", usage: 650 },
  { name: "Tech Migration", description: "Tech company relocations drive residential demand", type: "opportunity", usage: 430 },
];

export function PatternLibraryPage() {
  const navigate = useNavigate();

  const typeBadge = { opportunity: "default", risk: "destructive", seasonal: "secondary", predictive: "outline" } as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Pattern Library</h1><p className="text-muted-foreground">Reusable AI detection patterns</p></div>
        <Button onClick={() => navigate("/autonomous-platform")} className="gap-2">AI Platform <ArrowRight className="h-4 w-4"/></Button>
      </div>

      <div className="space-y-2">
        {patterns.map((pattern) => (
          <Card key={pattern.name}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{pattern.name}</span>
                    <Badge variant={typeBadge[pattern.type as keyof typeof typeBadge]}>{pattern.type}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{pattern.description}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{pattern.usage.toLocaleString()} matches</span>
                  <Button variant="ghost" size="icon"><Copy className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
