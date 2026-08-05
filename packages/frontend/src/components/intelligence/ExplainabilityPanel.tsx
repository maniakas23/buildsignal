import { useState } from "react";
import { BarChart3, TrendingUp, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

export function ExplainabilityPanel() {
  const [models] = useState([
    { id: "permit-model", name: "Permit Volume Predictor", accuracy: 0.94, features: 24, samples: 1800000 },
    { id: "growth-model", name: "Growth Rate Predictor", accuracy: 0.89, features: 18, samples: 3142 },
    { id: "signal-model", name: "Signal Score Predictor", accuracy: 0.92, features: 32, samples: 450000 },
  ]);

  const [selectedModel, setSelectedModel] = useState(models[0].id);
  const model = models.find((m) => m.id === selectedModel);

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Model Explainability</h3>
      </div>

      <div className="mb-4">
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm"
        >
          {models.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      {model && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-accent">
              <div className="text-xs text-muted-foreground">Accuracy</div>
              <div className="text-lg font-bold">{(model.accuracy * 100).toFixed(1)}%</div>
            </div>
            <div className="p-3 rounded-lg bg-accent">
              <div className="text-xs text-muted-foreground">Features</div>
              <div className="text-lg font-bold">{model.features}</div>
            </div>
            <div className="p-3 rounded-lg bg-accent">
              <div className="text-xs text-muted-foreground">Training Samples</div>
              <div className="text-lg font-bold">{(model.samples / 1000).toFixed(0)}K</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-primary/5">
            <div className="text-sm font-medium mb-2">Top Feature Importance</div>
            <div className="space-y-2">
              {[
                { name: "Permit volume (lag 3m)", importance: 0.28 },
                { name: "Population growth", importance: 0.22 },
                { name: "Employment rate", importance: 0.18 },
                { name: "Median income", importance: 0.15 },
                { name: "Competition density", importance: 0.12 },
              ].map((feature) => (
                <div key={feature.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{feature.name}</span>
                    <span className="font-medium">{(feature.importance * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${feature.importance * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
