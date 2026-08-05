import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, TrendingUp, Filter, ArrowUpDown } from "lucide-react";

export function OpportunitiesDashboard() {
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
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search opportunities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="flex gap-2">
        {(["volume", "growth", "confidence"] as const).map((s) => (
          <Button
            key={s}
            variant={sortBy === s ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy(s)}
          >
            <ArrowUpDown className="h-3 w-3 mr-1" />
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-4 w-32" /></CardHeader>
              <CardContent><Skeleton className="h-20 w-full" /></CardContent>
            </Card>
          ))
        ) : sorted.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No opportunities found
          </div>
        ) : (
          sorted.map((op) => (
            <Card key={op.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{op.title}</CardTitle>
                  <Badge variant={op.confidence > 80 ? "default" : op.confidence > 50 ? "secondary" : "outline"}>
                    {op.confidence}% confidence
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {op.county}, {op.state}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    {op.growthRate > 0 ? "+" : ""}{op.growthRate}% growth
                  </div>
                  <div className="text-sm text-muted-foreground">{op.volume} permits</div>
                  <p className="text-sm line-clamp-2">{op.description}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
