import { useState, useEffect } from "react";
import { RefreshCw, TrendingUp, AlertTriangle, Lightbulb, MapPin, ArrowRight, Bookmark } from "lucide-react";
import { trpc } from "@/providers/trpc";

export function OpportunityFeed() {
  const [feedType, setFeedType] = useState("all");
  const feed = trpc.liveIntelligence.feed.useQuery({ limit: 20 });

  const items = feed.data?.items || [];

  const getIcon = (type: string) => {
    switch (type) {
      case "opportunity": return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "alert": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "recommendation": return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      default: return <MapPin className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Live Intelligence Feed</h3>
        </div>
        <div className="flex gap-2">
          {["all", "opportunity", "alert", "recommendation"].map((type) => (
            <button
              key={type}
              onClick={() => setFeedType(type)}
              className={`rounded-lg px-3 py-1 text-xs ${
                feedType === type ? "bg-primary text-primary-foreground" : "border border-input hover:bg-accent"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <RefreshCw className="mx-auto h-8 w-8 mb-2 animate-spin" />
            <p>Loading intelligence feed...</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer">
              {getIcon(item.type)}
              <div className="flex-1">
                <div className="text-sm font-medium">{item.countyName}</div>
                <div className="text-xs text-muted-foreground">{item.message}</div>
                <div className="text-xs text-muted-foreground mt-1">{item.timestamp}</div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1 rounded hover:bg-background">
                  <Bookmark className="h-3 w-3 text-muted-foreground" />
                </button>
                <button className="p-1 rounded hover:bg-background">
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
