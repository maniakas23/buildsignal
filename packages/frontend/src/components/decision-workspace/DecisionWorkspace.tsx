import { useState } from "react";
import { Workflow, Layers, GitBranch, ArrowRight, CheckCircle } from "lucide-react";

export function DecisionWorkspace() {
  const [scenarios] = useState([
    { id: 1, name: "Harris County Expansion", status: "active", steps: ["Market Analysis", "Permit Review", "Competition Analysis", "Go/No-Go"], currentStep: 2 },
    { id: 2, name: "Maricopa County Entry", status: "draft", steps: ["Market Analysis", "Permit Review", "Competition Analysis", "Go/No-Go"], currentStep: 1 },
    { id: 3, name: "Travis County Renewal", status: "complete", steps: ["Market Analysis", "Permit Review", "Competition Analysis", "Go/No-Go"], currentStep: 4 },
  ]);

  const [selectedScenario, setSelectedScenario] = useState<number | null>(1);

  const scenario = scenarios.find((s) => s.id === selectedScenario);

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-6">
        <Workflow className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Decision Workspace</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground mb-2">Scenarios</div>
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedScenario(s.id)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                selectedScenario === s.id ? "border-primary bg-primary/5" : "hover:bg-accent"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{s.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  s.status === "active" ? "bg-blue-50 text-blue-700" :
                  s.status === "complete" ? "bg-green-50 text-green-700" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {s.status}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2">
          {scenario && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{scenario.name}</h4>
                <span className="text-sm text-muted-foreground">
                  Step {scenario.currentStep} of {scenario.steps.length}
                </span>
              </div>

              <div className="relative">
                <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-muted" />
                <div className="space-y-6">
                  {scenario.steps.map((step, i) => {
                    const stepNum = i + 1;
                    const isComplete = stepNum < scenario.currentStep;
                    const isCurrent = stepNum === scenario.currentStep;
                    return (
                      <div key={step} className="relative flex items-center gap-4 pl-12">
                        <div className={`absolute left-2 h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                          isComplete ? "bg-green-500 border-green-500" :
                          isCurrent ? "bg-blue-500 border-blue-500" :
                          "bg-background border-muted"
                        }`}>
                          {isComplete && <CheckCircle className="h-3 w-3 text-white" />}
                          {isCurrent && <div className="h-2 w-2 bg-white rounded-full" />}
                        </div>
                        <div className={`p-3 rounded-lg border flex-1 ${
                          isCurrent ? "border-primary bg-primary/5" : ""
                        }`}>
                          <div className="text-sm font-medium">{step}</div>
                          <div className="text-xs text-muted-foreground">
                            {isComplete ? "Completed" : isCurrent ? "In progress" : "Pending"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
