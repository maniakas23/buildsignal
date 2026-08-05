import { useState } from "react";
import { ThumbsUp, ThumbsDown, MessageSquare, Star, TrendingUp, Lightbulb } from "lucide-react";

export function RecommendationFeedback() {
  const [recommendations] = useState([
    { id: 1, county: "Harris County, TX", type: "commercial", confidence: 92, feedback: null },
    { id: 2, county: "Maricopa County, AZ", type: "residential", confidence: 88, feedback: "helpful" },
    { id: 3, county: "Travis County, TX", type: "mixed", confidence: 85, feedback: null },
  ]);

  const [feedback, setFeedback] = useState<Record<number, string | null>>({});

  const handleFeedback = (id: number, type: string) => {
    setFeedback((prev) => ({ ...prev, [id]: type }));
  };

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Recommendation Feedback</h3>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec) => (
          <div key={rec.id} className="p-4 rounded-lg bg-accent">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-medium">{rec.county}</div>
                <div className="text-xs text-muted-foreground">{rec.type} | Confidence: {rec.confidence}%</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFeedback(rec.id, "helpful")}
                className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs ${
                  feedback[rec.id] === "helpful" ? "bg-green-50 text-green-700" : "border border-input hover:bg-accent"
                }`}
              >
                <ThumbsUp className="h-3 w-3" />
                Helpful
              </button>
              <button
                onClick={() => handleFeedback(rec.id, "not_helpful")}
                className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs ${
                  feedback[rec.id] === "not_helpful" ? "bg-red-50 text-red-700" : "border border-input hover:bg-accent"
                }`}
              >
                <ThumbsDown className="h-3 w-3" />
                Not Helpful
              </button>
              <button
                onClick={() => handleFeedback(rec.id, "acted")}
                className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs ${
                  feedback[rec.id] === "acted" ? "bg-primary text-primary-foreground" : "border border-input hover:bg-accent"
                }`}
              >
                <TrendingUp className="h-3 w-3" />
                Acted On It
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
