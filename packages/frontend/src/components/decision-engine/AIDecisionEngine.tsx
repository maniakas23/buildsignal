import { useState } from "react";
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Lightbulb } from "lucide-react";

export function AIDecisionEngine() {
  const [analysis] = useState({
    marketScore: 8.5,
    riskLevel: "low",
    opportunities: [
      { county: "Harris County, TX", score: 9.2, type: "commercial", confidence: 95 },
      { county: "Maricopa County, AZ", score: 8.8, type: "residential", confidence: 88 },
      { county: "Travis County, TX", score: 8.5, type: "mixed", confidence: 85 },
    ],
    risks: [
      { county: "King County, WA", level: "medium", concern: "Slowing permit approvals" },
    ],
    recommendations: [
      "Prioritize Harris County for Q2 commercial pipeline",
      "Monitor Maricopa County residential trends",
      "Re-evaluate King County position in 30 days",
    ],
  });

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Decision Engine</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Market Score</div>
          <div className="text-2xl font-bold">{analysis.marketScore}/10</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Risk Level</div>
          <div className={`text-2xl font-bold ${
            analysis.riskLevel === "low" ? "text-green-500" :
            analysis.riskLevel === "medium" ? "text-yellow-500" :
            "text-red-500"
          }`}>
            {analysis.riskLevel.charAt(0).toUpperCase() + analysis.riskLevel.slice(1)}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-medium mb-3">Top Opportunities</h4>
        <div className="space-y-2">
          {analysis.opportunities.map((opp) => (
            <div key={opp.county} className="flex items-center justify-between p-3 rounded-lg bg-accent">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <div>
                  <div className="text-sm font-medium">{opp.county}</div>
                  <div className="text-xs text-muted-foreground">{opp.type} | Confidence: {opp.confidence}%</div>
                </div>
              </div>
              <div className="text-lg font-bold">{opp.score}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-medium mb-3">Risk Alerts</h4>
        <div className="space-y-2">
          {analysis.risks.map((risk) => (
            <div key={risk.county} className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <div>
                <div className="text-sm font-medium">{risk.county}</div>
                <div className="text-xs text-muted-foreground">{risk.concern}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-3">AI Recommendations</h4>
        <div className="space-y-2">
          {analysis.recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-primary/5">
              <Lightbulb className="h-4 w-4 text-primary mt-0.5" />
              <span className="text-sm">{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
