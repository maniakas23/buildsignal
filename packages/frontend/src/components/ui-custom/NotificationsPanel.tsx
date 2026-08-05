import { useState } from "react";
import { Bell, Check, X, Info, AlertTriangle, AlertCircle } from "lucide-react";
import { trpc } from "@/providers/trpc";

export function NotificationsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const alerts = trpc.alert.list.useQuery({});
  const utils = trpc.useContext();

  const ackMutation = trpc.alert.acknowledge.useMutation({
    onSuccess: () => utils.alert.list.invalidate(),
  });

  const unacknowledged = alerts.data?.filter((a) => a.status === "active") || [];

  const severityIcon = {
    critical: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const severityColor = {
    critical: "bg-red-50 text-red-600",
    warning: "bg-yellow-50 text-yellow-600",
    info: "bg-blue-50 text-blue-600",
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-accent"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unacknowledged.length > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
            {unacknowledged.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-card border rounded-lg shadow-lg z-50">
          <div className="p-3 border-b flex items-center justify-between">
            <span className="font-medium">Notifications</span>
            <button onClick={() => setIsOpen(false)} aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {alerts.data === undefined ? (
              <div className="p-4 text-sm text-muted-foreground">Loading...</div>
            ) : unacknowledged.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground text-center">
                No new notifications
              </div>
            ) : (
              unacknowledged.map((alert) => {
                const Icon = severityIcon[alert.severity] || Info;
                return (
                  <div
                    key={alert.id}
                    className="p-3 border-b last:border-b-0 hover:bg-accent/50"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`rounded-full p-1.5 shrink-0 ${severityColor[alert.severity]}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{alert.title}</div>
                        <div className="text-xs text-muted-foreground">{alert.message}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(alert.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => ackMutation.mutate({ alertId: alert.id })}
                        className="p-1 rounded hover:bg-accent shrink-0"
                        aria-label="Dismiss"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
