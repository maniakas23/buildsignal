import { useState, useEffect } from "react";
import { Newspaper, Bell, TrendingUp } from "lucide-react";

export function DailyExecutiveBriefing() {
  const [briefing, setBriefing] = useState<any>(null);

  useEffect(() => {
    // Load daily briefing data
    setBriefing({
      date: new Date().toLocaleDateString(),
      topStory: "Harris County approves $2B infrastructure plan",
      alerts: ["Maricopa County permit surge detected", "Travis County zoning change expected"],
      trends: ["Commercial permits up 15%", "Residential starts flat"],
    });
  }, []);

  if (!briefing) return null;

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Daily Executive Briefing</h3>
        <span className="text-sm text-muted-foreground">{briefing.date}</span>
      </div>
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Top Story</h4>
          <p className="text-sm text-muted-foreground">{briefing.topStory}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Bell className="h-4 w-4" /> Alerts
          </h4>
          <ul className="space-y-1">
            {briefing.alerts.map((alert: string, i: number) => (
              <li key={i} className="text-sm text-muted-foreground">{alert}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Trends
          </h4>
          <ul className="space-y-1">
            {briefing.trends.map((trend: string, i: number) => (
              <li key={i} className="text-sm text-muted-foreground">{trend}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
