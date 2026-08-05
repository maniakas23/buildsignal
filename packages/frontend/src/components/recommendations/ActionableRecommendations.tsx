import { useState } from "react";
import { Lightbulb, ArrowRight, Bookmark, CheckCircle, MapPin, TrendingUp, AlertTriangle, Target, Calendar } from "lucide-react";

export function ActionableRecommendations() {
  const [recommendations] = useState([
    {
      id: 1,
      county: "Harris County, TX",
      state: "TX",
      type: "commercial",
      confidence: 92,
      priority: "high",
      summary: "Permit volume up 25% QoQ. Strong commercial development signals.",
      actions: ["Schedule site visit", "Review permit pipeline", "Contact local developers"],
      timeline: "Within 2 weeks",
      expectedValue: "$2.4M",
    },
    {
      id: 2,
      county: "Maricopa County, AZ",
      state: "AZ",
      type: "residential",
      confidence: 88,
      priority: "medium",
      summary: "Population growth driving residential demand. Infrastructure projects underway.",
      actions: ["Monitor zoning changes", "Evaluate land opportunities", "Track infrastructure timeline"],
      timeline: "Within 1 month",
      expectedValue: "$1.8M",
    },
    {
      id: 3,
      county: "Travis County, TX",
      state: "TX",
      type: "mixed",
      confidence: 85,
      priority: "medium",
      summary: "Tech sector expansion creating mixed-use development opportunities.",
      actions: ["Analyze tech company expansions", "Review mixed-use zoning", "Assess transit access"],
      timeline: "Within 6 weeks",
      expectedValue: "$3.2M",
    },
  ]);

  const [selectedRecommendation, setSelectedRecommendation] = useState<number | null>(null);
  const recommendation = recommendations.find((r) => r.id === selectedRecommendation);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-50 text-red-700";
      case "medium": return "bg-yellow-50 text-yellow-700";
      case "low": return "bg-green-50 text-green-700";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "commercial": return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case "residential": return <MapPin className="h-4 w-4 text-green-500" />;
      case "mixed": return <Target className="h-4 w-4 text-purple-500" />;
      default: return <Lightbulb className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Actionable Recommendations</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground mb-2">Opportunities</div>
          {recommendations.map((rec) => (
            <button
              key={rec.id}
              onClick={() => setSelectedRecommendation(rec.id)}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                selectedRecommendation === rec.id ? "border-primary bg-primary/5" : "hover:bg-accent"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getTypeIcon(rec.type)}
                  <span className="font-medium">{rec.county}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(rec.priority)}`}>
                  {rec.priority}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">{rec.type} | Confidence: {rec.confidence}%</div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2">
          {recommendation ? (
            <div className="space-y-4">
              <div>
                <div className="text-lg font-semibold mb-2">{recommendation.county}</div>
                <div className="text-sm text-muted-foreground">{recommendation.summary}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-accent">
                  <div className="text-xs text-muted-foreground mb-1">Expected Value</div>
                  <div className="text-2xl font-bold text-green-500">{recommendation.expectedValue}</div>
                </div>
                <div className="p-4 rounded-lg bg-accent">
                  <div className="text-xs text-muted-foreground mb-1">Timeline</div>
                  <div className="text-lg font-bold">{recommendation.timeline}</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Recommended Actions</div>
                <div className="space-y-2">
                  {recommendation.actions.map((action, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-primary/5">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  <Bookmark className="h-4 w-4" />
                  Save
                </button>
                <button className="flex items-center gap-1 rounded-lg border border-input px-4 py-2 text-sm hover:bg-accent">
                  <ArrowRight className="h-4 w-4" />
                  View Details
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-accent text-sm text-muted-foreground">
              Select a recommendation to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
