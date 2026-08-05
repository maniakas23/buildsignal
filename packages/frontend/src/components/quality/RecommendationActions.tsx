import { useState } from "react";
import { Lightbulb, Bookmark, CheckCircle, X, ArrowRight, ThumbsUp, ThumbsDown } from "lucide-react";

export function RecommendationActions() {
  const [recommendations] = useState([
    { id: 1, county: "Harris County, TX", type: "commercial", confidence: 92, action: "expand", summary: "High permit volume suggests strong commercial demand" },
    { id: 2, county: "Maricopa County, AZ", type: "residential", confidence: 88, action: "monitor", summary: "Population growth driving residential demand" },
    { id: 3, county: "Travis County, TX", type: "mixed", confidence: 85, action: "investigate", summary: "Tech sector growth creating mixed-use opportunities" },
  ]);

  const [feedback, setFeedback] = useState<Record<number, string | null>>({});

  const getActionColor = (action: string) => {
    switch (action) {
      case "expand": return "bg-green-50 text-green-700";
      case "monitor": return "bg-yellow-50 text-yellow-700";
      case "investigate": return "bg-blue-50 text-blue-700";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Recommendation Actions</h3>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec) => (
          <div key={rec.id} className="p-4 rounded-lg bg-accent">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{rec.county}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${getActionColor(rec.action)}`}>
                  {rec.action}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">Confidence: {rec.confidence}%</span>
            </div>
            <div className="text-sm text-muted-foreground mb-3">{rec.summary}</div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFeedback((prev) => ({ ...prev, [rec.id]: "helpful" }))}
                className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs ${
                  feedback[rec.id] === "helpful" ? "bg-green-50 text-green-700" : "border border-input hover:bg-accent"
                }`}
              >
                <ThumbsUp className="h-3 w-3" />
                Helpful
              </button>
              <button
                onClick={() => setFeedback((prev) => ({ ...prev, [rec.id]: "not_helpful" }))}
                className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs ${
                  feedback[rec.id] === "not_helpful" ? "bg-red-50 text-red-700" : "border border-input hover:bg-accent"
                }`}
              >
                <ThumbsDown className="h-3 w-3" />
                Not Helpful
              </button>
              <button className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1 text-xs text-primary-foreground hover:bg-primary/90 ml-auto">
                <ArrowRight className="h-3 w-3" />
                Act
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
