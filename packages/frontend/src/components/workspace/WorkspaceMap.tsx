import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";

export function WorkspaceMap() {
  const { data: opportunities, isLoading: oppLoading } = trpc.opportunity.list.useQuery({ limit: 50 });
  const { data: searchResults } = trpc.search.global.useQuery({ query: "" }, { enabled: false });

  if (oppLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  const counties = opportunities?.items?.map((opp) => ({ name: opp.county, state: opp.state, confidence: opp.confidence })) || [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Geographic Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Interactive map visualization</p>
              <p className="text-sm text-muted-foreground">{counties.length} counties with opportunities</p>
            </div>
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-3">
            {counties.slice(0, 6).map((county, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-md border">
                <MapPin className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-sm font-medium">{county.name}</div>
                  <div className="text-xs text-muted-foreground">{county.state} · {county.confidence}% confidence</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
