import { useState } from "react";
import { Database, CheckCircle, AlertTriangle, BarChart3, TrendingUp, Activity } from "lucide-react";

export function DataQualityPanel() {
  const [metrics] = useState({
    completeness: 98.5,
    accuracy: 96.2,
    freshness: 94.8,
    consistency: 97.3,
    totalRecords: 2456789,
    lastUpdate: "2024-01-15T10:30:00Z",
  });

  const [sources] = useState([
    { name: "Permit Data", records: 1245678, quality: 98.2, freshness: "2 hours ago" },
    { name: "Population Data", records: 3142, quality: 99.1, freshness: "1 day ago" },
    { name: "Economic Indicators", records: 89000, quality: 97.5, freshness: "3 hours ago" },
    { name: "Construction Starts", records: 456789, quality: 96.8, freshness: "6 hours ago" },
  ]);

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-6">
        <Database className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Data Quality</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Completeness</div>
          <div className="text-2xl font-bold">{metrics.completeness}%</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Accuracy</div>
          <div className="text-2xl font-bold">{metrics.accuracy}%</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Freshness</div>
          <div className="text-2xl font-bold">{metrics.freshness}%</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Consistency</div>
          <div className="text-2xl font-bold">{metrics.consistency}%</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-muted-foreground mb-2">Data Sources</div>
        {sources.map((source) => (
          <div key={source.name} className="flex items-center justify-between p-3 rounded-lg bg-accent">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">{source.name}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{source.records.toLocaleString()} records</span>
              <span>Quality: {source.quality}%</span>
              <span>Updated {source.freshness}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
