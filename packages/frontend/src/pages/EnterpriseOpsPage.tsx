import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Server, Activity, AlertTriangle, Settings, RefreshCw } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { Skeleton } from "@/components/ui/skeleton";

export function EnterpriseOpsPage() {
  const { data: status, isLoading, refetch } = trpc.monitoring.status.useQuery();
  const { data: alerts } = trpc.monitoring.alerts.useQuery();
  const { data: metrics } = trpc.monitoring.summary.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Enterprise Operations</h1>
        <Button variant="outline" onClick={() => refetch()} className="gap-2"><RefreshCw className="h-4 w-4"/>Refresh</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">System Status</CardTitle></CardHeader><CardContent><div className="flex items-center gap-2"><Server className={`h-5 w-5 ${status?.status === "healthy" ? "text-green-500" : "text-yellow-500"}`}/><span className="font-medium capitalize">{status?.status || "Unknown"}</span></div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Active Alerts</CardTitle></CardHeader><CardContent><div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-yellow-500"/><span className="font-medium">{alerts?.length || 0}</span></div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Uptime</CardTitle></CardHeader><CardContent><div className="flex items-center gap-2"><Activity className="h-5 w-5 text-green-500"/><span className="font-medium">{metrics?.uptime || "99.9%"}</span></div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Latency</CardTitle></CardHeader><CardContent><div className="flex items-center gap-2"><Settings className="h-5 w-5 text-blue-500"/><span className="font-medium">{metrics?.latency || 0}ms</span></div></CardContent></Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="alerts">Alerts</TabsTrigger><TabsTrigger value="metrics">Metrics</TabsTrigger></TabsList>
        <TabsContent value="overview" className="mt-4"><div className="text-muted-foreground">System overview dashboard</div></TabsContent>
        <TabsContent value="alerts" className="mt-4">
          <div className="space-y-2">
            {alerts?.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2"><AlertTriangle className={`h-4 w-4 ${alert.severity === "critical" ? "text-red-500" : "text-yellow-500"}`}/><div className="flex-1"><div className="font-medium text-sm">{alert.title}</div><div className="text-xs text-muted-foreground">{alert.message}</div></div><Badge variant={alert.severity === "critical" ? "destructive" : "secondary"}>{alert.severity}</Badge></div>
                </CardContent>
              </Card>
            )) || <p className="text-muted-foreground">No active alerts</p>}
          </div>
        </TabsContent>
        <TabsContent value="metrics" className="mt-4"><div className="text-muted-foreground">Detailed metrics</div></TabsContent>
      </Tabs>
    </div>
  );
}
