import { useState } from "react";
import { AlertTriangle, Bell, CheckCircle, Filter, Search, Settings } from "lucide-react";
import { trpc } from "@/providers/trpc";

export function AlertsPage() {
  const [severity, setSeverity] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const alerts = trpc.alert.list.useQuery({ severity: severity as any, status: status as any });
  const summary = trpc.alert.summary.useQuery();
  const acknowledge = trpc.alert.acknowledge.useMutation({
    onSuccess: () => alerts.refetch(),
  });
  const archive = trpc.alert.archive.useMutation({
    onSuccess: () => alerts.refetch(),
  });

  const severityIcon = {
    critical: <AlertTriangle className="h-5 w-5 text-red-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    info: <Bell className="h-5 w-5 text-blue-500" />,
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Alerts</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 border rounded-lg bg-card">
          <div className="text-sm text-muted-foreground">Total</div>
          <div className="text-2xl font-bold">{summary.data?.total || 0}</div>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <div className="text-sm text-muted-foreground">Critical</div>
          <div className="text-2xl font-bold text-red-500">{summary.data?.critical || 0}</div>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <div className="text-sm text-muted-foreground">Warning</div>
          <div className="text-2xl font-bold text-yellow-500">{summary.data?.warning || 0}</div>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <div className="text-sm text-muted-foreground">Active</div>
          <div className="text-2xl font-bold text-blue-500">{summary.data?.active || 0}</div>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search alerts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm"
          />
        </div>
        <select
          value={severity || ""}
          onChange={(e) => setSeverity(e.target.value || null)}
          className="rounded-lg border border-input bg-background px-4 py-2 text-sm"
        >
          <option value="">All Severities</option>
          <option value="critical">Critical</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>
        <select
          value={status || ""}
          onChange={(e) => setStatus(e.target.value || null)}
          className="rounded-lg border border-input bg-background px-4 py-2 text-sm"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="space-y-4">
        {alerts.data?.alerts?.map((alert) => (
          <div key={alert.id} className="p-4 border rounded-lg bg-card">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {severityIcon[alert.severity as keyof typeof severityIcon] || <Bell className="h-5 w-5" />}
                <div>
                  <h3 className="font-semibold">{alert.title}</h3>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                  <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
                    <span>{alert.category}</span>
                    <span>{alert.status}</span>
                    <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {alert.status === "active" && (
                  <button
                    onClick={() => acknowledge.mutate({ id: alert.id })}
                    className="rounded-lg border border-input px-3 py-1 text-xs hover:bg-accent"
                  >
                    Acknowledge
                  </button>
                )}
                <button
                  onClick={() => archive.mutate({ id: alert.id })}
                  className="rounded-lg border border-input px-3 py-1 text-xs hover:bg-accent"
                >
                  Archive
                </button>
              </div>
            </div>
          </div>
        ))}
        {alerts.data?.alerts?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <CheckCircle className="mx-auto h-12 w-12 mb-4" />
            <p>No alerts at this time</p>
          </div>
        )}
      </div>
    </div>
  );
}
