import { useState } from "react";
import { Workflow, MapPin, TrendingUp, AlertTriangle, Lightbulb, CheckCircle, ArrowRight, Clock, Bookmark, X } from "lucide-react";

export function OpportunityLifecycleManager() {
  const [opportunities] = useState([
    { id: 1, county: "Harris County, TX", stage: "evaluation", confidence: 92, createdAt: "2024-01-15", assignedTo: "John Doe", priority: "high" },
    { id: 2, county: "Maricopa County, AZ", stage: "pursuit", confidence: 88, createdAt: "2024-01-10", assignedTo: "Jane Smith", priority: "medium" },
    { id: 3, county: "Travis County, TX", stage: "discovery", confidence: 85, createdAt: "2024-01-18", assignedTo: null, priority: "medium" },
    { id: 4, county: "King County, WA", stage: "closed_won", confidence: 95, createdAt: "2024-01-05", assignedTo: "Bob Johnson", priority: "high" },
  ]);

  const [filter, setFilter] = useState("all");
  const [selectedOpportunity, setSelectedOpportunity] = useState<number | null>(null);

  const stages = [
    { id: "discovery", label: "Discovery", color: "bg-blue-50 text-blue-700" },
    { id: "evaluation", label: "Evaluation", color: "bg-yellow-50 text-yellow-700" },
    { id: "pursuit", label: "Pursuit", color: "bg-orange-50 text-orange-700" },
    { id: "negotiation", label: "Negotiation", color: "bg-purple-50 text-purple-700" },
    { id: "closed_won", label: "Closed Won", color: "bg-green-50 text-green-700" },
    { id: "closed_lost", label: "Closed Lost", color: "bg-red-50 text-red-700" },
  ];

  const filtered = opportunities.filter((o) => filter === "all" || o.stage === filter);
  const selected = opportunities.find((o) => o.id === selectedOpportunity);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-500";
      case "medium": return "text-yellow-500";
      case "low": return "text-green-500";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Workflow className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Opportunity Lifecycle</h3>
        </div>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-1 text-sm"
          >
            <option value="all">All Stages</option>
            {stages.map((stage) => (
              <option key={stage.id} value={stage.id}>{stage.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="space-y-2">
            {filtered.map((opportunity) => {
              const stage = stages.find((s) => s.id === opportunity.stage);
              return (
                <button
                  key={opportunity.id}
                  onClick={() => setSelectedOpportunity(opportunity.id === selectedOpportunity ? null : opportunity.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    selectedOpportunity === opportunity.id ? "border-primary bg-primary/5" : "hover:bg-accent"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{opportunity.county}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${stage?.color}`}>
                      {stage?.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Confidence: {opportunity.confidence}%</span>
                    <span className={getPriorityColor(opportunity.priority)}>Priority: {opportunity.priority}</span>
                    <span>Created: {opportunity.createdAt}</span>
                    {opportunity.assignedTo && <span>Assigned: {opportunity.assignedTo}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          {selected && (
            <div className="p-4 rounded-lg bg-accent">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium">{selected.county}</span>
                <button onClick={() => setSelectedOpportunity(null)}>
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Stage</div>
                  <div className="flex items-center gap-2">
                    {stages.map((stage, i) => (
                      <div key={stage.id} className="flex items-center">
                        <div className={`h-3 w-3 rounded-full ${
                          stage.id === selected.stage ? "bg-primary" : "bg-muted"
                        }`} />
                        {i < stages.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-1">Confidence</div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${selected.confidence}%` }} />
                  </div>
                  <div className="text-sm font-medium mt-1">{selected.confidence}%</div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-1">Assigned To</div>
                  <div className="text-sm">{selected.assignedTo || "Unassigned"}</div>
                </div>

                <div className="flex gap-2">
                  <button className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1 text-xs text-primary-foreground hover:bg-primary/90">
                    <Bookmark className="h-3 w-3" />
                    Save
                  </button>
                  <button className="flex items-center gap-1 rounded-lg border border-input px-3 py-1 text-xs hover:bg-accent">
                    <ArrowRight className="h-3 w-3" />
                    Advance
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
