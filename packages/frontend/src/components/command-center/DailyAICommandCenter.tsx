import { useState } from "react";
import { Command, Activity, Zap } from "lucide-react";

export function DailyAICommandCenter() {
  const [commands] = useState([
    { name: "Market Analysis", status: "complete", result: "8 opportunities identified" },
    { name: "Alert Scan", status: "running", result: "Processing..." },
    { name: "Pattern Detection", status: "pending", result: "Waiting" },
  ]);

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Command className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Command Center</h3>
      </div>
      <div className="space-y-3">
        {commands.map((cmd) => (
          <div key={cmd.name} className="flex items-center justify-between p-3 rounded-lg bg-accent">
            <div>
              <div className="text-sm font-medium">{cmd.name}</div>
              <div className="text-xs text-muted-foreground">{cmd.result}</div>
            </div>
            <div className="flex items-center gap-2">
              {cmd.status === "complete" && <Zap className="h-4 w-4 text-green-500" />}
              {cmd.status === "running" && <Activity className="h-4 w-4 text-blue-500 animate-pulse" />}
              {cmd.status === "pending" && <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />}
              <span className="text-xs text-muted-foreground">{cmd.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
