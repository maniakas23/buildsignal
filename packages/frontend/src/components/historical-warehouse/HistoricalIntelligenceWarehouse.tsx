import { useState } from "react";
import { Database, TrendingUp, Calendar, Search, Filter, Download } from "lucide-react";

export function HistoricalIntelligenceWarehouse() {
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("12m");

  const datasets = [
    { id: 1, name: "Permit Data (2020-2024)", records: "2.4M", size: "1.2 GB", lastUpdated: "2024-01-15" },
    { id: 2, name: "Population Estimates", records: "3,142", size: "45 MB", lastUpdated: "2024-01-10" },
    { id: 3, name: "Economic Indicators", records: "180K", size: "320 MB", lastUpdated: "2024-01-12" },
    { id: 4, name: "Construction Starts", records: "890K", size: "680 MB", lastUpdated: "2024-01-14" },
  ];

  const trends = [
    { metric: "Permit Volume", change: "+15%", period: "YoY" },
    { metric: "Growth Rate", change: "+2.3%", period: "YoY" },
    { metric: "Construction Starts", change: "+8%", period: "YoY" },
  ];

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Historical Intelligence Warehouse</h3>
        </div>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-1 text-sm"
          >
            <option value="3m">3 months</option>
            <option value="6m">6 months</option>
            <option value="12m">12 months</option>
            <option value="24m">24 months</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {trends.map((trend) => (
          <div key={trend.metric} className="p-4 rounded-lg bg-accent">
            <div className="text-sm text-muted-foreground">{trend.metric}</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold">{trend.change}</span>
              <span className="text-xs text-muted-foreground">{trend.period}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search datasets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        {datasets.map((dataset) => (
          <div key={dataset.id} className="flex items-center justify-between p-3 rounded-lg bg-accent">
            <div className="flex items-center gap-3">
              <Database className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">{dataset.name}</div>
                <div className="text-xs text-muted-foreground">{dataset.records} records | {dataset.size}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Updated {dataset.lastUpdated}</span>
              <button className="p-2 rounded-lg hover:bg-background">
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
