import { useState } from "react";
import { TrendingUp, MapPin, ArrowRight, CheckCircle, Clock, XCircle, Bookmark } from "lucide-react";

export function OpportunityLifecycleTracker() {
  const [opportunities] = useState([
    { id: 1, county: "Harris County, TX", stage: "evaluation", confidence: 92, timeline: [{ stage: "discovery", date: "2024-01-10" }, { stage: "evaluation", date: "2024-01-15" }] },
    { id: 2, county: "Maricopa County, AZ", stage: "pursuit", confidence: 88, timeline: [{ stage: "discovery", date: "2024-01-05" }, { stage: "evaluation", date: "2024-01-08" }, { stage: "pursuit", date: "2024-01-12" }] },
  ]);

  const stages = ["discovery", "evaluation", "pursuit", "negotiation", "closed"];

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Opportunity Lifecycle</h3>
      </div>

      <div className="space-y-6">
        {opportunities.map((opportunity) => (
          <div key={opportunity.id} className="p-4 rounded-lg bg-accent">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{opportunity.county}</span>
              </div>
              <div className="text-xs text-muted-foreground">Confidence: {opportunity.confidence}%</div>
            </div>

            <div className="relative">
              <div className="absolute left-4 top-4 right-4 h-0.5 bg-muted" />
              <div className="relative flex justify-between">
                {stages.map((stage, i) => {
                  const completed = opportunity.timeline.some((t) => t.stage === stage);
                  const current = opportunity.stage === stage;
                  return (
                    <div key={stage} className="flex flex-col items-center">
                      <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center relative z-10 ${
                        completed ? "bg-green-500 border-green-500" :
                        current ? "bg-primary border-primary" :
                        "bg-background border-muted"
                      }`}>
                        {completed ? <CheckCircle className="h-4 w-4 text-white" /> :
                         current ? <Clock className="h-4 w-4 text-white" /> :
                         <div className="h-2 w-2 rounded-full bg-muted" />}
                      </div>
                      <span className={`text-xs mt-2 capitalize ${
                        completed || current ? "font-medium" : "text-muted-foreground"
                      }`}>
                        {stage}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
