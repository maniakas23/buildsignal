import { useState, useMemo } from "react";
import { Map, TrendingUp, AlertTriangle, Lightbulb, ChevronDown, ChevronUp, Star, Bookmark } from "lucide-react";
import { trpc } from "@/providers/trpc";

export function OpportunityDashboard() {
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "list" | "grid">("list");

  const counties = trpc.county.list.useQuery({ limit: 50 });
  const topCounties = trpc.county.top.useQuery({ limit: 10 });
  const recommendations = trpc.recommendation.list.useQuery({ limit: 10 });
  const alerts = trpc.alert.list.useQuery({ limit: 5 });

  const opportunities = useMemo(() => {
    return counties.data?.counties?.map((county) => ({
      ...county,
      trend: county.growthRate > 2 ? "up" : county.growthRate < 0 ? "down" : "stable",
    })) || [];
  }, [counties.data]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Opportunities</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">Counties</span>
          </div>
          <div className="text-2xl font-bold mt-2">{counties.data?.counties?.length || 0}</div>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <span className="text-sm text-muted-foreground">Recommendations</span>
          </div>
          <div className="text-2xl font-bold mt-2">{recommendations.data?.recommendations?.length || 0}</div>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span className="text-sm text-muted-foreground">Alerts</span>
          </div>
          <div className="text-2xl font-bold mt-2">{alerts.data?.alerts?.length || 0}</div>
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setViewMode("list")}
          className={`rounded-lg px-4 py-2 text-sm ${viewMode === "list" ? "bg-primary text-primary-foreground" : "border border-input"}`}
        >
          List
        </button>
        <button
          onClick={() => setViewMode("grid")}
          className={`rounded-lg px-4 py-2 text-sm ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "border border-input"}`}
        >
          Grid
        </button>
        <button
          onClick={() => setViewMode("map")}
          className={`rounded-lg px-4 py-2 text-sm ${viewMode === "map" ? "bg-primary text-primary-foreground" : "border border-input"}`}
        >
          Map
        </button>
      </div>

      <div className="space-y-4">
        {opportunities.map((county) => (
          <div
            key={county.id}
            className="p-4 border rounded-lg bg-card cursor-pointer hover:bg-accent"
            onClick={() => setSelectedCounty(county.id)}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{county.name}</h3>
                <p className="text-sm text-muted-foreground">{county.state}</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">Signal Score: {county.signalScore}</div>
                <div className="text-xs text-muted-foreground">Growth: {county.growthRate}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
