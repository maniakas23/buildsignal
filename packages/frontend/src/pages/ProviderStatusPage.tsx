import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Server, Activity, ArrowRight, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ProviderStatusPage() {
  const navigate = useNavigate();
  const { data: status, isLoading, refetch } = trpc.monitoring.status.useQuery();
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
        <h1 className="text-2xl font-bold">Provider Status</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()} className="gap-2"><RefreshCw className="h-4 w-4"/>Refresh</Button>
          <Button onClick={() => navigate("/intelligence-ops")} className="gap-2">Intelligence Ops <ArrowRight className="h-4 w-4"/></Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="p-6"><div className="flex items-center gap-2"><Server className={`h-5 w-5 ${status?.status === "healthy" ? "text-green-500" : "text-yellow-500"}`}/><div><div className="font-medium">Status</div><div className="text-sm text-muted-foreground capitalize">{status?.status || "Unknown"}</div></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center gap-2"><Activity className="h-5 w-5 text-green-500"/><div><div className="font-medium">Uptime</div><div className="text-sm text-muted-foreground">{metrics?.uptime || "99.9%"}</div></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center gap-2"><Activity className="h-5 w-5 text-blue-500"/><div><div className="font-medium">Latency</div><div className="text-sm text-muted-foreground">{metrics?.latency || 0}ms</div></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center gap-2"><Activity className="h-5 w-5 text-purple-500"/><div><div className="font-medium">Requests</div><div className="text-sm text-muted-foreground">{metrics?.requests || 0}/min</div></div></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Service Providers</CardTitle></CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Third-party provider status and integration health</div>
        </CardContent>
      </Card>
    </div>
  );
}
