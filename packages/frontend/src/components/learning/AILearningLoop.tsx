import { useState } from "react";
import { RefreshCw, TrendingUp, Brain, Target, Lightbulb, CheckCircle, XCircle } from "lucide-react";

export function AILearningLoop() {
  const [loops] = useState([
    { id: 1, name: "Permit Volume Model", iteration: 47, accuracy: 0.94, improvement: 0.02, status: "improving" },
    { id: 2, name: "Growth Rate Model", iteration: 32, accuracy: 0.89, improvement: 0.01, status: "stable" },
    { id: 3, name: "Signal Score Model", iteration: 55, accuracy: 0.92, improvement: 0.03, status: "improving" },
  ]);

  const [metrics] = useState({
    totalIterations: 134,
    averageImprovement: 0.018,
    modelsActive: 3,
    lastDeployment: "2024-01-15",
  });

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-6">
        <RefreshCw className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Learning Loop</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Iterations</div>
          <div className="text-2xl font-bold">{metrics.totalIterations}</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Avg Improvement</div>
          <div className="text-2xl font-bold text-green-500">+{(metrics.averageImprovement * 100).toFixed(1)}%</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Active Models</div>
          <div className="text-2xl font-bold">{metrics.modelsActive}</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Last Deploy</div>
          <div className="text-lg font-bold">{metrics.lastDeployment}</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium text-muted-foreground mb-2">Model Iterations</div>
        {loops.map((loop) => (
          <div key={loop.id} className="p-4 rounded-lg bg-accent">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <span className="font-medium">{loop.name}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                loop.status === "improving" ? "bg-green-50 text-green-700" :
                loop.status === "stable" ? "bg-blue-50 text-blue-700" :
                "bg-yellow-50 text-yellow-700"
              }`}>
                {loop.status}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Iteration</div>
                <div className="font-medium">#{loop.iteration}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Accuracy</div>
                <div className="font-medium">{(loop.accuracy * 100).toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Improvement</div>
                <div className="font-medium text-green-500">+{(loop.improvement * 100).toFixed(1)}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
