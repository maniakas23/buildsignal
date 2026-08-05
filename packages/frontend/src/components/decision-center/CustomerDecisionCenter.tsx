import { useState } from "react";
import { Heart, ThumbsUp, ThumbsDown, MessageSquare, Star } from "lucide-react";

export function CustomerDecisionCenter() {
  const [decisions] = useState([
    { id: 1, county: "Harris County, TX", decision: "Pursue", confidence: 92, factors: ["High permit volume", "Strong growth", "Favorable zoning"] },
    { id: 2, county: "Maricopa County, AZ", decision: "Watch", confidence: 78, factors: ["Moderate growth", "Pending zoning review"] },
    { id: 3, county: "Travis County, TX", decision: "Pursue", confidence: 88, factors: ["Strong tech sector", "High demand"] },
  ]);

  const [selectedDecision, setSelectedDecision] = useState<number | null>(null);

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-6">
        <Heart className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Customer Decision Center</h3>
      </div>

      <div className="space-y-4">
        {decisions.map((decision) => (
          <div
            key={decision.id}
            className={`p-4 rounded-lg border cursor-pointer transition-colors ${
              selectedDecision === decision.id ? "border-primary bg-primary/5" : "hover:bg-accent"
            }`}
            onClick={() => setSelectedDecision(decision.id === selectedDecision ? null : decision.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  decision.decision === "Pursue" ? "bg-green-100 text-green-600" :
                  decision.decision === "Watch" ? "bg-yellow-100 text-yellow-600" :
                  "bg-red-100 text-red-600"
                }`}>
                  {decision.decision === "Pursue" ? <ThumbsUp className="h-5 w-5" /> :
                   decision.decision === "Watch" ? <Star className="h-5 w-5" /> :
                   <ThumbsDown className="h-5 w-5" />}
                </div>
                <div>
                  <div className="font-medium">{decision.county}</div>
                  <div className="text-sm text-muted-foreground">Confidence: {decision.confidence}%</div>
                </div>
              </div>
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                decision.decision === "Pursue" ? "bg-green-50 text-green-700" :
                decision.decision === "Watch" ? "bg-yellow-50 text-yellow-700" :
                "bg-red-50 text-red-700"
              }`}>
                {decision.decision}
              </span>
            </div>

            {selectedDecision === decision.id && (
              <div className="mt-4 pt-4 border-t">
                <div className="text-sm font-medium mb-2">Decision Factors</div>
                <ul className="space-y-1">
                  {decision.factors.map((factor, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
