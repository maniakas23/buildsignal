import { useState } from "react";
import { Map, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";
import { trpc } from "@/providers/trpc";

export function DashboardWidgets() {
  const counties = trpc.county.top.useQuery({ limit: 5 });
  const recommendations = trpc.recommendation.list.useQuery({ limit: 3 });
  const alerts = trpc.alert.list.useQuery({ limit: 3 });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-4 border rounded-lg bg-card">
        <div className="flex items-center gap-2 mb-2">
          <Map className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Top Counties</span>
        </div>
        <div className="space-y-2">
          {counties.data?.counties?.map((county) => (
            <div key={county.id} className="flex items-center justify-between text-sm">
              <span>{county.name}</span>
              <span className="font-medium">{county.signalScore}</span>
            </div>
          )) || <p className="text-sm text-muted-foreground">No data</p>}
        </div>
      </div>

      <div className="p-4 border rounded-lg bg-card">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium">Growth Leaders</span>
        </div>
        <div className="space-y-2">
          {counties.data?.counties?.slice(0, 3).map((county) => (
            <div key={county.id} className="flex items-center justify-between text-sm">
              <span>{county.name}</span>
              <span className="text-green-500">+{county.growthRate}%</span>
            </div>
          )) || <p className="text-sm text-muted-foreground">No data</p>}
        </div>
      </div>

      <div className="p-4 border rounded-lg bg-card">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <span className="text-sm font-medium">Recent Alerts</span>
        </div>
        <div className="space-y-2">
          {alerts.data?.alerts?.map((alert) => (
            <div key={alert.id} className="text-sm">
              <div className="font-medium">{alert.title}</div>
              <div className="text-muted-foreground">{alert.category}</div>
            </div>
          )) || <p className="text-sm text-muted-foreground">No alerts</p>}
        </div>
      </div>

      <div className="p-4 border rounded-lg bg-card">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium">Recommendations</span>
        </div>
        <div className="space-y-2">
          {recommendations.data?.recommendations?.map((rec) => (
            <div key={rec.id} className="text-sm">
              <div className="font-medium">{rec.countyName}</div>
              <div className="text-muted-foreground">{rec.type}</div>
            </div>
          )) || <p className="text-sm text-muted-foreground">No recommendations</p>}
        </div>
      </div>
    </div>
  );
}
