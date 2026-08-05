import { useState } from "react";
import { Gauge, TrendingUp, TrendingDown, Minus } from "lucide-react";

export function AIConfidenceEngine() {
  const [confidence] = useState([
    { county: "Harris County, TX", score: 85, trend: "up" },
    { county: "Maricopa County, AZ", score: 92, trend: "up" },
    { county: "Travis County, TX", score: 78, trend: "stable" },
  ]);

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Gauge className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Confidence Scores</h3>
      </div>
      <div className="space-y-3">
        {confidence.map((c) => (
          <div key={c.county} className="flex items-center justify-between p-3 rounded-lg bg-accent">
            <span className="text-sm font-medium">{c.county}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">{c.score}%</span>
              {c.trend === "up" && <TrendingUp className="h-4 w-4 text-green-500" />}
              {c.trend === "down" && <TrendingDown className="h-4 w-4 text-red-500" />}
              {c.trend === "stable" && <Minus className="h-4 w-4 text-yellow-500" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
