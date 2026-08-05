import { useState } from "react";
import { Brain, Lightbulb, ArrowRight } from "lucide-react";

export function AIDecisionAssistant() {
  const [query, setQuery] = useState("");
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const handleQuery = () => {
    setRecommendations([
      "Focus on Harris County, TX - high permit volume and growth rate",
      "Consider Maricopa County, AZ - strong population growth signals",
      "Monitor King County, WA - stable but high-value market",
    ]);
  };

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Decision Assistant</h3>
      </div>
      <div className="space-y-4">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about market opportunities..."
          className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm min-h-[100px]"
        />
        <button
          onClick={handleQuery}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <ArrowRight className="h-4 w-4" />
          Get Recommendations
        </button>
        {recommendations.length > 0 && (
          <div className="space-y-2">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-accent">
                <Lightbulb className="h-4 w-4 text-yellow-500 mt-1" />
                <p className="text-sm">{rec}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
