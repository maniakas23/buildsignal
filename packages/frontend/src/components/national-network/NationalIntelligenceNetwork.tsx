import { useState } from "react";
import { Globe, MapPin, TrendingUp, Users, BarChart3, ArrowRight } from "lucide-react";

export function NationalIntelligenceNetwork() {
  const [regions] = useState([
    { id: "southwest", name: "Southwest", counties: 450, signals: 234, alerts: 12, growth: 3.2 },
    { id: "northeast", name: "Northeast", counties: 380, signals: 189, alerts: 8, growth: 1.8 },
    { id: "midwest", name: "Midwest", counties: 520, signals: 156, alerts: 15, growth: 2.1 },
    { id: "southeast", name: "Southeast", counties: 410, signals: 198, alerts: 10, growth: 2.8 },
    { id: "west", name: "West", counties: 320, signals: 167, alerts: 6, growth: 2.5 },
  ]);

  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const totalCounties = regions.reduce((sum, r) => sum + r.counties, 0);
  const totalSignals = regions.reduce((sum, r) => sum + r.signals, 0);
  const totalAlerts = regions.reduce((sum, r) => sum + r.alerts, 0);
  const avgGrowth = regions.reduce((sum, r) => sum + r.growth, 0) / regions.length;

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-6">
        <Globe className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">National Intelligence Network</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Counties</div>
          <div className="text-2xl font-bold">{totalCounties.toLocaleString()}</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Signals</div>
          <div className="text-2xl font-bold">{totalSignals.toLocaleString()}</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Alerts</div>
          <div className="text-2xl font-bold text-red-500">{totalAlerts}</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Avg Growth</div>
          <div className="text-2xl font-bold text-green-500">+{avgGrowth.toFixed(1)}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {regions.map((region) => (
          <button
            key={region.id}
            onClick={() => setSelectedRegion(region.id === selectedRegion ? null : region.id)}
            className={`p-4 rounded-lg border text-left transition-colors ${
              selectedRegion === region.id ? "border-primary bg-primary/5" : "hover:bg-accent"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{region.name}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
              <div>{region.counties} counties</div>
              <div>{region.signals} signals</div>
              <div className={region.growth > 2.5 ? "text-green-500" : ""}>+{region.growth}%</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
