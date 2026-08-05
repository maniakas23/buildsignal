import { useState, useEffect } from "react";
import { Newspaper, TrendingUp, AlertTriangle, Calendar } from "lucide-react";

export function WeeklyDigest() {
  const [digest, setDigest] = useState({
    week: "Week of Jan 15-21, 2024",
    topOpportunities: ["Harris County, TX", "Maricopa County, AZ", "Travis County, TX"],
    alerts: ["Permit surge in Harris County", "Zoning change in Maricopa County"],
    trends: ["Commercial up 15%", "Residential flat"],
  });

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Weekly Digest</h3>
        <span className="text-sm text-muted-foreground ml-auto">{digest.week}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Top Opportunities</span>
          </div>
          <ul className="space-y-1">
            {digest.topOpportunities.map((county) => (
              <li key={county} className="text-sm text-muted-foreground">{county}</li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium">Key Alerts</span>
          </div>
          <ul className="space-y-1">
            {digest.alerts.map((alert) => (
              <li key={alert} className="text-sm text-muted-foreground">{alert}</li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Trends</span>
          </div>
          <ul className="space-y-1">
            {digest.trends.map((trend) => (
              <li key={trend} className="text-sm text-muted-foreground">{trend}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
