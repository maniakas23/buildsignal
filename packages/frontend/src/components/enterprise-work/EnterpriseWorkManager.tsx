import { useState } from "react";
import { Briefcase, Users, CheckSquare, Clock, AlertTriangle } from "lucide-react";

export function EnterpriseWorkManager() {
  const [tasks] = useState([
    { id: 1, title: "Review Harris County permits", assignee: "John Doe", priority: "high", status: "in_progress", due: "2024-01-25" },
    { id: 2, title: "Maricopa County site visit", assignee: "Jane Smith", priority: "medium", status: "pending", due: "2024-01-28" },
    { id: 3, title: "Travis County competitor analysis", assignee: "Bob Johnson", priority: "low", status: "complete", due: "2024-01-20" },
    { id: 4, title: "Weekly team briefing", assignee: "Team", priority: "medium", status: "pending", due: "2024-01-26" },
  ]);

  const [filter, setFilter] = useState("all");

  const filteredTasks = tasks.filter((t) => filter === "all" || t.status === filter);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-500 bg-red-50";
      case "medium": return "text-yellow-500 bg-yellow-50";
      case "low": return "text-green-500 bg-green-50";
      default: return "text-muted-foreground bg-muted";
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Work Manager</h3>
        </div>
        <div className="flex gap-2">
          {["all", "pending", "in_progress", "complete"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1 text-xs ${
                filter === f ? "bg-primary text-primary-foreground" : "border border-input hover:bg-accent"
              }`}
            >
              {f.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-accent">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${getPriorityColor(task.priority)}`}>
                {task.priority === "high" ? <AlertTriangle className="h-4 w-4" /> :
                 task.priority === "medium" ? <Clock className="h-4 w-4" /> :
                 <CheckSquare className="h-4 w-4" />}
              </div>
              <div>
                <div className="text-sm font-medium">{task.title}</div>
                <div className="text-xs text-muted-foreground">{task.assignee} | Due: {task.due}</div>
              </div>
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
