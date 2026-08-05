import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, TrendingUp, ArrowUpDown, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function OpportunitiesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"volume" | "growth" | "confidence">("volume");
  const { data, isLoading } = trpc.opportunity.list.useQuery({ limit: 50, search: search || undefined });

  const opportunities = data?.items || [];
  const sorted = [...opportunities].sort((a, b) => {
    if (sortBy === "volume") return b.volume - a.volume;
    if (sortBy === "growth") return b.growthRate - a.growthRate;
    if (sortBy === "confidence") return b.confidence - a.confidence;
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Opportunities</h1><p className="text-muted-foreground">AI-identified construction opportunities</p></div>
        <Button onClick={() => navigate("/opportunity-dashboard")} className="gap-2">Dashboard <ArrowRight className="h-4 w-4"/></Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search opportunities..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          {(["volume", "growth", "confidence"] as const).map((s) => (
            <Button key={s} variant={sortBy === s ? "default" : "outline"} size="sm" onClick={() => setSortBy(s)}><ArrowUpDown className="h-3 w-3 mr-1"/>{s.charAt(0).toUpperCase() + s.slice(1)}</Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Card key={i}><CardHeader><Skeleton className="h-4 w-32" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>)
        ) : sorted.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">No opportunities found</div>
        ) : (
          sorted.map((opp) => (
            <Card key={opp.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/opportunities/${opp.id}`)}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{opp.title}</CardTitle>
                  <Badge variant={opp.confidence > 80 ? "default" : opp.confidence > 50 ? "secondary" : "outline"}>{opp.confidence}%</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{opp.county}, {opp.state}</div>
                  <div className="flex items-center gap-2 text-sm"><TrendingUp className="h-4 w-4 text-green-500" />{opp.growthRate > 0 ? "+" : ""}{opp.growthRate}% growth</div>
                  <div className="text-sm text-muted-foreground">{opp.volume} permits</div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
