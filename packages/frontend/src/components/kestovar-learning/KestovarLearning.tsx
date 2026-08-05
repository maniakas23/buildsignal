import { useState } from "react";
import { Brain, TrendingUp, BookOpen, Lightbulb, Target, ArrowRight } from "lucide-react";

export function KestovarLearning() {
  const [models] = useState([
    { id: "permit-predictor", name: "Permit Volume Predictor", version: "v2.4.1", accuracy: 0.94, lastTrained: "2024-01-15", status: "active" },
    { id: "growth-predictor", name: "Growth Rate Predictor", version: "v2.3.8", accuracy: 0.89, lastTrained: "2024-01-10", status: "active" },
    { id: "signal-predictor", name: "Signal Score Predictor", version: "v2.4.0", accuracy: 0.92, lastTrained: "2024-01-12", status: "training" },
  ]);

  const [learningMetrics] = useState({
    totalTrainingCycles: 1247,
    dataPointsProcessed: 2456789,
    averageAccuracy: 0.917,
    improvementRate: 0.023,
  });

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Kestovar Learning</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Training Cycles</div>
          <div className="text-2xl font-bold">{learningMetrics.totalTrainingCycles.toLocaleString()}</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Data Points</div>
          <div className="text-2xl font-bold">{(learningMetrics.dataPointsProcessed / 1000000).toFixed(1)}M</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Avg Accuracy</div>
          <div className="text-2xl font-bold">{(learningMetrics.averageAccuracy * 100).toFixed(1)}%</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Improvement</div>
          <div className="text-2xl font-bold text-green-500">+{(learningMetrics.improvementRate * 100).toFixed(1)}%</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium text-muted-foreground mb-2">Active Models</div>
        {models.map((model) => (
          <div key={model.id} className="flex items-center justify-between p-3 rounded-lg bg-accent">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${model.status === "active" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`}>
                <Brain className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-medium">{model.name}</div>
                <div className="text-xs text-muted-foreground">{model.version} | Trained {model.lastTrained}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-bold">{(model.accuracy * 100).toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">accuracy</div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                model.status === "active" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
              }`}>
                {model.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
