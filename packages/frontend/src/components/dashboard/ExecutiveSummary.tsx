import { useMemo } from "react";
import { TrendingUp, AlertTriangle, Lightbulb, Activity } from "lucide-react";
import { trpc } from "@/providers/trpc";

export function ExecutiveSummary() {
  const feed = trpc.liveIntelligence.feed.useQuery();
  const alertSummary = trpc.alert.summary.useQuery();

  const stats = useMemo(() => {
    return {
      opportunities: feed.data?.items?.length || 0,
      alerts: alertSummary.data?.critical || 0,
      signalScore: 8.5,
      trends: ["up", "stable", "up"],
    };
  }, [feed.data, alertSummary.data]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="p-4 border rounded-lg bg-card">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          <span className="text-sm text-muted-foreground">Opportunities</span>
        </div>
        <div className="text-2xl font-bold mt-2">{stats.opportunities}</div>
      </div>
      <div className="p-4 border rounded-lg bg-card">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <span className="text-sm text-muted-foreground">Critical Alerts</span>
        </div>
        <div className="text-2xl font-bold mt-2">{stats.alerts}</div>
      </div>
      <div className="p-4 border rounded-lg bg-card">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-500" />
          <span className="text-sm text-muted-foreground">Signal Score</span>
        </div>
        <div className="text-2xl font-bold mt-2">{stats.signalScore}</div>
      </div>
      <div className="p-4 border rounded-lg bg-card">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <span className="text-sm text-muted-foreground">Trends</span>
        </div>
        <div className="text-2xl font-bold mt-2">{stats.trends.length}</div>
      </div>
    </div>
  );
}
