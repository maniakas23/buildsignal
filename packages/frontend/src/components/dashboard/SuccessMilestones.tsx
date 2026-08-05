import { useState } from "react";
import { Trophy, Star, Target, TrendingUp, Award } from "lucide-react";

export function SuccessMilestones() {
  const [milestones] = useState([
    { id: 1, name: "First Login", description: "Successfully signed in to BuildSignal", completed: true, icon: Star, date: "2024-01-15" },
    { id: 2, name: "County Explorer", description: "Viewed 10 county profiles", completed: true, icon: Target, date: "2024-01-18" },
    { id: 3, name: "Alert Master", description: "Acknowledged 5 alerts", completed: true, icon: Trophy, date: "2024-01-20" },
    { id: 4, name: "Recommendation Pro", description: "Acted on 3 recommendations", completed: false, icon: TrendingUp, progress: 67, date: null },
    { id: 5, name: "Data Expert", description: "Generated 5 custom reports", completed: false, icon: Award, progress: 40, date: null },
  ]);

  const completed = milestones.filter((m) => m.completed).length;
  const total = milestones.length;
  const percent = Math.round((completed / total) * 100);

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-yellow-500" />
        <h3 className="text-lg font-semibold">Success Milestones</h3>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Progress</span>
          <span className="text-sm font-medium">{completed}/{total} ({percent}%)</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {milestones.map((milestone) => {
          const Icon = milestone.icon;
          return (
            <div
              key={milestone.id}
              className={`flex items-start gap-3 p-3 rounded-lg ${
                milestone.completed ? "bg-green-50/50" : "bg-accent"
              }`}
            >
              <div className={`p-2 rounded-full ${
                milestone.completed ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"
              }`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{milestone.name}</div>
                  {milestone.completed && (
                    <span className="text-xs text-green-600 font-medium">Completed</span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">{milestone.description}</div>
                {!milestone.completed && milestone.progress !== undefined && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${milestone.progress}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{milestone.progress}% complete</div>
                  </div>
                )}
                {milestone.completed && milestone.date && (
                  <div className="text-xs text-green-600 mt-1">Completed on {milestone.date}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
