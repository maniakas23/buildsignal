import { useState } from "react";
import { TrendingUp, ArrowUpRight, ArrowDownRight, Brain, Calendar, Target } from "lucide-react";

export function PredictiveIntelligence() {
  const [predictions] = useState([
    { county: "Harris County, TX", metric: "Permit Volume", current: 2450, predicted: 3120, change: 27.3, confidence: 92, period: "Q2 2024" },
    { county: "Maricopa County, AZ", metric: "Growth Rate", current: 2.8, predicted: 3.5, change: 25.0, confidence: 88, period: "Q2 2024" },
    { county: "Travis County, TX", metric: "Commercial Starts", current: 89, predicted: 112, change: 25.8, confidence: 85, period: "Q2 2024" },
  ]);

  const [selectedPrediction, setSelectedPrediction] = useState<number | null>(0);

  const prediction = predictions[selectedPrediction ?? 0];

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Predictive Intelligence</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground mb-2">Predictions</div>
          {predictions.map((pred, i) => (
            <button
              key={i}
              onClick={() => setSelectedPrediction(i)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                selectedPrediction === i ? "border-primary bg-primary/5" : "hover:bg-accent"
              }`}
            >
              <div className="text-sm font-medium">{pred.county}</div>
              <div className="text-xs text-muted-foreground">{pred.metric}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-medium ${pred.change > 0 ? "text-green-500" : "text-red-500"}`}>
                  {pred.change > 0 ? "+" : ""}{pred.change}%
                </span>
                <span className="text-xs text-muted-foreground">Confidence: {pred.confidence}%</span>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2">
          {prediction && (
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-3">{prediction.county} — {prediction.metric}</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-accent">
                    <div className="text-xs text-muted-foreground mb-1">Current</div>
                    <div className="text-2xl font-bold">{prediction.current.toLocaleString()}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/5">
                    <div className="text-xs text-muted-foreground mb-1">Predicted ({prediction.period})</div>
                    <div className="text-2xl font-bold text-primary">{prediction.predicted.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Confidence</span>
                  <span className="text-sm font-bold">{prediction.confidence}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${prediction.confidence}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-accent">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Prediction Method</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Gradient Boosting Ensemble with historical permit data, population trends, and economic indicators.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
