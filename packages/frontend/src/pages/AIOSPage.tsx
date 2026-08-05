import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Cpu, Activity, Zap, Brain, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AIOSPage() {
  const navigate = useNavigate();
  const { data: status, isLoading } = trpc.monitoring.kestovar.useQuery();
  const { data: summary } = trpc.monitoring.summary.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Engine Status", value: status?.status || "Unknown", icon: Cpu, color: status?.status === "online" ? "text-green-500" : "text-yellow-500" },
    { label: "Predictions", value: summary?.predictions?.toString() || "0", icon: Brain, color: "text-blue-500" },
    { label: "Accuracy", value: `${summary?.accuracy || 0}%`, icon: Activity, color: "text-green-500" },
    { label: "Latency", value: `${summary?.latency || 0}ms`, icon: Zap, color: "text-yellow-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Operating System</h1>
          <p className="text-muted-foreground">Kestovar Engine intelligence dashboard</p>
        </div>
        <Button onClick={() => navigate("/dashboard")} className="gap-2">
          Go to Dashboard <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
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
          <CardHeader><CardTitle>Capabilities</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {["Pattern Analysis", "Predictive Intelligence", "Knowledge Graph", "Anomaly Detection", "Correlation Analysis"].map((cap) => (
                <Badge key={cap} variant="secondary">{cap}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>System Health</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>API Response</span>
                <span className="font-medium">{status?.latency || 0}ms</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Availability</span>
                <span className="font-medium">{status?.uptime || "99.9%"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Last Updated</span>
                <span className="font-medium">{status?.lastUpdated ? new Date(status.lastUpdated).toLocaleTimeString() : "N/A"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
