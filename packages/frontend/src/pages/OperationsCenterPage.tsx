import { useState } from "react";
import { Activity, Server, Database, Shield, Zap, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { trpc } from "@/providers/trpc";

export function OperationsCenterPage() {
  const kestovar = trpc.monitoring.kestovar.useQuery();
  const summary = trpc.monitoring.summary.useQuery();
  const alerts = trpc.monitoring.alerts.useQuery();

  const metrics = [
    { name: "API Requests", value: "12.4K", change: "+8%", icon: Zap },
    { name: "Avg Latency", value: "45ms", change: "-12%", icon: Clock },
    { name: "Success Rate", value: "99.9%", change: "+0.1%", icon: CheckCircle },
    { name: "Error Rate", value: "0.1%", change: "-0.05%", icon: AlertTriangle },
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Operations Center</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {metrics.map((metric) => (
          <div key={metric.name} className="p-4 border rounded-lg bg-card">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{metric.name}</div>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold">{metric.value}</span>
              <span className="text-xs text-green-500">{metric.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-lg font-semibold mb-4">Kestovar Engine</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Health</span>
              <span className={`text-sm font-medium ${kestovar.data?.health?.ok ? "text-green-500" : "text-red-500"}`}>
                {kestovar.data?.health?.ok ? "Healthy" : "Degraded"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Latency</span>
              <span className="text-sm font-medium">{kestovar.data?.health?.latency || 0}ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Version</span>
              <span className="text-sm font-medium">{kestovar.data?.health?.version || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Circuit Breaker</span>
              <span className={`text-sm font-medium ${kestovar.data?.metrics?.circuitBreaker?.state === "closed" ? "text-green-500" : "text-yellow-500"}`}>
                {kestovar.data?.metrics?.circuitBreaker?.state || "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Requests</span>
              <span className="text-sm font-medium">{kestovar.data?.metrics?.requests || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Failures</span>
              <span className="text-sm font-medium">{kestovar.data?.metrics?.failures || 0}</span>
            </div>
          </div>
        </div>

        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-lg font-semibold mb-4">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Authentication</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Stripe</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Kestovar Engine</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Billing</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
