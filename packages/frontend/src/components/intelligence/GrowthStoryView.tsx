import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight, Calendar } from "lucide-react";

export function GrowthStoryView() {
  const [story, setStory] = useState({
    county: "Harris County, TX",
    period: "2020-2024",
    narrative: "Harris County has experienced a sustained growth trajectory driven by energy sector expansion, population inflows, and infrastructure investment.",
    milestones: [
      { year: 2020, event: "Pandemic slowdown", impact: "negative", detail: "Permit volume down 15%" },
      { year: 2021, event: "Recovery begins", impact: "positive", detail: "Permit volume up 8%" },
      { year: 2022, event: "Energy boom", impact: "positive", detail: "Commercial permits up 35%" },
      { year: 2023, event: "Infrastructure wave", impact: "positive", detail: "Public works up 42%" },
      { year: 2024, event: "Sustained growth", impact: "positive", detail: "All-time high permit volume" },
    ],
  });

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case "positive": return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case "negative": return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Growth Story</h3>
      </div>

      <div className="mb-4">
        <div className="text-sm font-medium">{story.county}</div>
        <div className="text-xs text-muted-foreground">{story.period}</div>
      </div>

      <p className="text-sm text-muted-foreground mb-6">{story.narrative}</p>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />
        <div className="space-y-4">
          {story.milestones.map((milestone) => (
            <div key={milestone.year} className="relative flex items-start gap-4 pl-12">
              <div className={`absolute left-2 h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                milestone.impact === "positive" ? "bg-green-500 border-green-500" :
                milestone.impact === "negative" ? "bg-red-500 border-red-500" :
                "bg-yellow-500 border-yellow-500"
              }`}>
                {getImpactIcon(milestone.impact)}
              </div>
              <div className="flex-1 p-3 rounded-lg bg-accent">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{milestone.year}</span>
                </div>
                <div className="text-sm mt-1">{milestone.event}</div>
                <div className="text-xs text-muted-foreground">{milestone.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
