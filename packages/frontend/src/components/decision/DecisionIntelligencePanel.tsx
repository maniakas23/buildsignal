import { useState } from "react";
import { BarChart3, TrendingUp, AlertTriangle, Lightbulb, Brain } from "lucide-react";

export function DecisionIntelligencePanel() {
  const [insights] = useState([
    { type: "opportunity", county: "Harris County, TX", message: "Permit volume up 25% QoQ", confidence: 92, impact: "high" },
    { type: "risk", county: "King County, WA", message: "Approval delays increasing", confidence: 78, impact: "medium" },
    { type: "trend", county: "Maricopa County, AZ", message: "Residential demand surge", confidence: 88, impact: "high" },
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case "opportunity": return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "risk": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "trend": return <BarChart3 className="h-4 w-4 text-blue-500" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case "opportunity": return "bg-green-50";
      case "risk": return "bg-red-50";
      case "trend": return "bg-blue-50";
      default: return "bg-accent";
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Decision Intelligence</h3>
      </div>

      <div className="space-y-3">
        {insights.map((insight, i) => (
          <div key={i} className={`p-3 rounded-lg ${getBgColor(insight.type)}`}>
            <div className="flex items-start gap-3">
              {getIcon(insight.type)}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{insight.county}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                    insight.impact === "high" ? "bg-red-100 text-red-700" :
                    insight.impact === "medium" ? "bg-yellow-100 text-yellow-700" :
                    "bg-green-100 text-green-700"
                  }`}>
                    {insight.impact} impact
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">{insight.message}</div>
                <div className="text-xs text-muted-foreground mt-1">Confidence: {insight.confidence}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
