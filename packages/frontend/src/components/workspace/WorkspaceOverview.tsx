import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, CheckCircle2, MapPin, Building2 } from "lucide-react";

export function WorkspaceOverview() {
  const { data: feed, isLoading: feedLoading } = trpc.opportunity.list.useQuery({ limit: 10 });
  const { data: alerts, isLoading: alertsLoading } = trpc.alert.list.useQuery({ limit: 5 });
  const { data: recommendations, isLoading: recLoading } = trpc.recommendation.list.useQuery({ limit: 5 });

  const isLoading = feedLoading || alertsLoading || recLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const stats = [
    { label: "Active Opportunities", value: feed?.items?.length || 0, icon: TrendingUp, color: "text-green-500" },
    { label: "Active Alerts", value: alerts?.items?.filter((a) => a.status === "active")?.length || 0, icon: AlertTriangle, color: "text-yellow-500" },
    { label: "Recommendations", value: recommendations?.items?.length || 0, icon: CheckCircle2, color: "text-blue-500" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Recent Opportunities</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {feed?.items?.slice(0, 5).map((opp) => (
                <div key={opp.id} className="flex items-center justify-between p-2 rounded-md border">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-sm font-medium">{opp.title}</div>
                      <div className="text-xs text-muted-foreground">{opp.county}, {opp.state}</div>
                    </div>
                  </div>
                  <Badge variant="outline">{opp.confidence}%</Badge>
                </div>
              )) || <p className="text-sm text-muted-foreground">No opportunities</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Alerts</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts?.items?.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-center gap-2 p-2 rounded-md border">
                  <AlertTriangle className={`h-4 w-4 ${alert.severity === "critical" ? "text-red-500" : "text-yellow-500"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{alert.title}</div>
                    <div className="text-xs text-muted-foreground">{alert.message}</div>
                  </div>
                </div>
              )) || <p className="text-sm text-muted-foreground">No alerts</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
