import { useState } from "react";
import { Timeline, TrendingUp, AlertTriangle, Lightbulb, CheckCircle, Calendar } from "lucide-react";

export function OpportunityTimeline() {
  const [events] = useState([
    { id: 1, date: "2024-01-15", type: "detection", title: "Signal detected", description: "Harris County permit volume anomaly detected", confidence: 92 },
    { id: 2, date: "2024-01-16", type: "analysis", title: "Pattern analysis", description: "Confirmed 25% QoQ growth trend", confidence: 88 },
    { id: 3, date: "2024-01-17", type: "recommendation", title: "Recommendation generated", description: "High confidence opportunity identified", confidence: 95 },
    { id: 4, date: "2024-01-18", type: "alert", title: "Alert sent", description: "User notified of new opportunity", confidence: 100 },
    { id: 5, date: "2024-01-20", type: "action", title: "User action", description: "User saved recommendation for review", confidence: 100 },
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case "detection": return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case "analysis": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "recommendation": return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      case "alert": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "action": return <CheckCircle className="h-4 w-4 text-primary" />;
      default: return <Calendar className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-6">
        <Timeline className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Opportunity Timeline</h3>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="relative flex items-start gap-4 pl-12">
              <div className="absolute left-2 h-5 w-5 rounded-full bg-primary border-2 border-background flex items-center justify-center">
                {getIcon(event.type)}
              </div>
              <div className="flex-1 p-3 rounded-lg bg-accent">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{event.title}</span>
                  <span className="text-xs text-muted-foreground">{event.date}</span>
                </div>
                <div className="text-sm text-muted-foreground">{event.description}</div>
                {event.confidence < 100 && (
                  <div className="text-xs text-muted-foreground mt-1">Confidence: {event.confidence}%</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
