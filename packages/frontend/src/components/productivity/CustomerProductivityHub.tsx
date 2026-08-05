import { useState } from "react";
import { BarChart3, TrendingUp, Users, Clock, Target, Zap, CheckCircle, Star } from "lucide-react";

export function CustomerProductivityHub() {
  const [metrics] = useState({
    timeSaved: 45,
    opportunitiesFound: 12,
    alertsActed: 8,
    reportsGenerated: 5,
    accuracy: 94,
    efficiency: 87,
  });

  const [activities] = useState([
    { id: 1, action: "Viewed Harris County opportunity", time: "2 min ago", type: "opportunity" },
    { id: 2, action: "Acknowledged Maricopa County alert", time: "15 min ago", type: "alert" },
    { id: 3, action: "Generated weekly report", time: "1 hour ago", type: "report" },
    { id: 4, action: "Saved Travis County recommendation", time: "2 hours ago", type: "recommendation" },
  ]);

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Productivity Hub</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Hours Saved</div>
          <div className="text-2xl font-bold">{metrics.timeSaved}h</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Opportunities</div>
          <div className="text-2xl font-bold">{metrics.opportunitiesFound}</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Accuracy</div>
          <div className="text-2xl font-bold">{metrics.accuracy}%</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Efficiency</div>
          <div className="text-2xl font-bold">{metrics.efficiency}%</div>
        </div>
      </div>

      <div>
        <div className="text-sm font-medium text-muted-foreground mb-2">Recent Activity</div>
        <div className="space-y-2">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-accent">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div className="flex-1">
                <div className="text-sm">{activity.action}</div>
              </div>
              <div className="text-xs text-muted-foreground">{activity.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
