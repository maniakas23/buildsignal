import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, ArrowRight, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ProjectFeed() {
  const navigate = useNavigate();
  const { data, isLoading } = trpc.opportunity.list.useQuery({ limit: 20 });
  const opportunities = data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Project Feed</h1><p className="text-muted-foreground">Latest construction projects and opportunities</p></div>
        <Button onClick={() => navigate("/opportunities")} className="gap-2">All Opportunities <ArrowRight className="h-4 w-4"/></Button>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
        ) : opportunities.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No projects available</div>
        ) : (
          opportunities.map((opp) => (
            <Card key={opp.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/opportunities/${opp.id}`)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium">{opp.title}</div>
                      <div className="text-sm text-muted-foreground">{opp.county}, {opp.state} · {opp.volume} permits</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={opp.confidence > 80 ? "default" : "secondary"}>{opp.confidence}%</Badge>
                    <Button variant="ghost" size="icon"><ExternalLink className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
