import { useState } from "react";
import { Brain, HelpCircle, BarChart3, MessageSquare, Lightbulb, AlertTriangle } from "lucide-react";

export function ExplainabilityPanel() {
  const [explanations] = useState([
    {
      id: 1,
      recommendation: "Harris County, TX — High growth potential",
      confidence: 92,
      factors: [
        { name: "Permit volume", weight: 0.35, direction: "positive", value: "+25% QoQ" },
        { name: "Population growth", weight: 0.25, direction: "positive", value: "+3.2% YoY" },
        { name: "Employment rate", weight: 0.20, direction: "positive", value: "97.2%" },
        { name: "Competition density", weight: 0.20, direction: "negative", value: "High" },
      ],
      model: "Gradient Boosting Ensemble",
      version: "v2.4.1",
    },
    {
      id: 2,
      recommendation: "Maricopa County, AZ — Moderate opportunity",
      confidence: 78,
      factors: [
        { name: "Permit volume", weight: 0.35, direction: "positive", value: "+12% QoQ" },
        { name: "Population growth", weight: 0.25, direction: "positive", value: "+2.8% YoY" },
        { name: "Employment rate", weight: 0.20, direction: "neutral", value: "94.5%" },
        { name: "Competition density", weight: 0.20, direction: "negative", value: "Medium" },
      ],
      model: "Gradient Boosting Ensemble",
      version: "v2.4.1",
    },
  ]);

  const [selectedExplanation, setSelectedExplanation] = useState<number | null>(1);

  const explanation = explanations.find((e) => e.id === selectedExplanation);

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Explainability</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground mb-2">Recommendations</div>
          {explanations.map((ex) => (
            <button
              key={ex.id}
              onClick={() => setSelectedExplanation(ex.id)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                selectedExplanation === ex.id ? "border-primary bg-primary/5" : "hover:bg-accent"
              }`}
            >
              <div className="font-medium text-sm">{ex.recommendation}</div>
              <div className="text-xs text-muted-foreground">Confidence: {ex.confidence}%</div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2">
          {explanation && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{explanation.recommendation}</h4>
                <div className="text-xs text-muted-foreground">{explanation.model} ({explanation.version})</div>
              </div>

              <div className="space-y-3">
                {explanation.factors.map((factor) => (
                  <div key={factor.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{factor.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${
                          factor.direction === "positive" ? "text-green-500" :
                          factor.direction === "negative" ? "text-red-500" :
                          "text-muted-foreground"
                        }`}>
                          {factor.value}
                        </span>
                        <span className="text-xs text-muted-foreground">{(factor.weight * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          factor.direction === "positive" ? "bg-green-500" :
                          factor.direction === "negative" ? "bg-red-500" :
                          "bg-yellow-500"
                        }`}
                        style={{ width: `${factor.weight * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-lg bg-primary/5">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-primary mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium">Why this recommendation?</div>
                    <div className="text-muted-foreground">
                      The model identified strong permit growth and population trends as key positive signals, while high competition density is a mitigating factor.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
