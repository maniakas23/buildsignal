import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { Server, Activity, AlertTriangle, CheckCircle2, Clock, RefreshCw } from "lucide-react";

export function OpsDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { data: status, isLoading: statusLoading, refetch: refetchStatus } = trpc.monitoring.status.useQuery();
  const { data: alerts, isLoading: alertsLoading } = trpc.monitoring.alerts.useQuery();
  const { data: metrics, isLoading: metricsLoading } = trpc.monitoring.summary.useQuery();

  const isLoading = statusLoading || alertsLoading || metricsLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Operations Dashboard</h1>
        <Button variant="outline" onClick={() => refetchStatus()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">System Status</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Server className={`h-5 w-5 ${status?.status === "healthy" ? "text-green-500" : "text-yellow-500"}`} />
                    <span className="font-medium capitalize">{status?.status || "Unknown"}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Active Alerts</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium">{alerts?.length || 0}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Uptime</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-medium">{metrics?.uptime || "99.9%"}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Response Time</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">{metrics?.latency || "45ms"}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <div className="space-y-2">
            {alerts?.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`h-4 w-4 ${alert.severity === "critical" ? "text-red-500" : "text-yellow-500"}`} />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{alert.title}</div>
                      <div className="text-xs text-muted-foreground">{alert.message}</div>
                    </div>
                    <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"}>{alert.severity}</Badge>
                  </div>
                </CardContent>
              </Card>
            )) || <p className="text-muted-foreground">No active alerts</p>}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <pre className="text-sm overflow-auto">{JSON.stringify(metrics, null, 2)}</pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployments" className="mt-4">
          <div className="text-muted-foreground">Deployment history will appear here</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
