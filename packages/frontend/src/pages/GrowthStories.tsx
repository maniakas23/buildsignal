import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowRight, Building2, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const stories = [
  { county: "Maricopa, AZ", title: "Phoenix Metro Boom", description: "Residential permits surged 45% after tech company relocations", growth: 45, timeline: "2023-2024" },
  { county: "Harris, TX", title: "Houston Industrial Renaissance", description: "Energy sector investment drove commercial construction up 38%", growth: 38, timeline: "2022-2024" },
  { county: "Travis, TX", title: "Austin Tech Corridor", description: "Mixed-use development accelerated by remote work migration", growth: 52, timeline: "2021-2024" },
  { county: "Denver, CO", title: "Mile High Expansion", description: "Infrastructure investment spurred residential growth of 29%", growth: 29, timeline: "2022-2024" },
];

export function GrowthStoriesPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Growth Stories</h1><p className="text-muted-foreground">Case studies from high-growth markets</p></div>
        <Button onClick={() => navigate("/opportunities")} className="gap-2">Explore <ArrowRight className="h-4 w-4"/></Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {stories.map((story, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{story.title}</CardTitle>
                <Badge variant="default">+{story.growth}%</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Building2 className="h-4 w-4"/>{story.county}</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="h-4 w-4"/>{story.timeline}</div>
              <p className="text-sm">{story.description}</p>
              <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-500"/><span className="text-sm font-medium">{story.growth}% permit growth</span></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
