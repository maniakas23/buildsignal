import { useState } from "react";
import { Priority, ArrowUp, ArrowDown, Clock, CheckCircle, AlertTriangle, Target, BarChart3 } from "lucide-react";

export function PriorityDashboard() {
  const [tasks] = useState([
    { id: 1, title: "Harris County permit surge analysis", priority: "critical", status: "in_progress", assignee: "AI Engine", due: "2024-01-20", impact: "high" },
    { id: 2, title: "Maricopa County trend review", priority: "high", status: "pending", assignee: "Analyst", due: "2024-01-22", impact: "medium" },
    { id: 3, title: "Travis County recommendation update", priority: "medium", status: "complete", assignee: "AI Engine", due: "2024-01-18", impact: "medium" },
    { id: 4, title: "King County alert threshold tuning", priority: "low", status: "pending", assignee: "Engineering", due: "2024-01-25", impact: "low" },
  ]);

  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("priority");

  const filtered = tasks.filter((t) => filter === "all" || t.priority === filter);
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "priority") {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return order[a.priority as keyof typeof order] - order[b.priority as keyof typeof order];
    }
    return 0;
  });

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "critical": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "high": return <ArrowUp className="h-4 w-4 text-orange-500" />;
      case "medium": return <Clock className="h-4 w-4 text-yellow-500" />;
      case "low": return <ArrowDown className="h-4 w-4 text-green-500" />;
      default: return <Target className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-50 text-red-700";
      case "high": return "bg-orange-50 text-orange-700";
      case "medium": return "bg-yellow-50 text-yellow-700";
      case "low": return "bg-green-50 text-green-700";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Priority className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Priority Dashboard</h3>
        </div>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-1 text-sm"
          >
            <option value="all">All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        {sorted.map((task) => (
          <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-accent">
            <div className="flex items-center gap-3">
              {getPriorityIcon(task.priority)}
              <div>
                <div className="text-sm font-medium">{task.title}</div>
                <div className="text-xs text-muted-foreground">
                  {task.assignee} | Due: {task.due} | Impact: {task.impact}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                task.status === "complete" ? "bg-green-50 text-green-700" :
                task.status === "in_progress" ? "bg-blue-50 text-blue-700" :
                "bg-muted text-muted-foreground"
              }`}>
                {task.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
