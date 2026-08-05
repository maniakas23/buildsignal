import { useState } from "react";
import { BarChart3, TrendingUp, TrendingDown, Minus, HelpCircle } from "lucide-react";

export function ConfidenceBreakdown() {
  const [breakdown] = useState({
    overall: 88,
    factors: [
      { name: "Data Quality", weight: 0.25, score: 92, trend: "up" },
      { name: "Model Accuracy", weight: 0.30, score: 89, trend: "stable" },
      { name: "Signal Strength", weight: 0.25, score: 85, trend: "up" },
      { name: "Market Context", weight: 0.20, score: 87, trend: "down" },
    ],
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down": return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Confidence Breakdown</h3>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Overall Confidence</span>
          <span className="text-2xl font-bold">{breakdown.overall}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${breakdown.overall}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {breakdown.factors.map((factor) => (
          <div key={factor.name} className="p-3 rounded-lg bg-accent">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{factor.name}</span>
                <span className="text-xs text-muted-foreground">({(factor.weight * 100).toFixed(0)}%)</span>
              </div>
              <div className="flex items-center gap-2">
                {getTrendIcon(factor.trend)}
                <span className="text-sm font-bold">{factor.score}%</span>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  factor.score >= 90 ? "bg-green-500" :
                  factor.score >= 80 ? "bg-yellow-500" :
                  "bg-red-500"
                }`}
                style={{ width: `${factor.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
