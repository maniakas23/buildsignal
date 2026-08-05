import { useState } from "react";
import { Lightbulb, Bookmark, ArrowRight } from "lucide-react";
import { trpc } from "@/providers/trpc";

export function PersonalizedRecommendations() {
  const recommendations = trpc.recommendation.list.useQuery({ limit: 5 });
  const save = trpc.recommendation.save.useMutation({
    onSuccess: () => recommendations.refetch(),
  });

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-5 w-5 text-yellow-500" />
        <h3 className="text-lg font-semibold">Personalized Recommendations</h3>
      </div>
      <div className="space-y-3">
        {recommendations.data?.recommendations?.map((rec) => (
          <div key={rec.id} className="flex items-start justify-between p-3 rounded-lg bg-accent">
            <div>
              <div className="font-medium">{rec.countyName}, {rec.state}</div>
              <div className="text-sm text-muted-foreground">{rec.summary}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Confidence: {rec.confidence}% | {rec.type}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => save.mutate({ id: rec.id })}
                className="p-2 rounded-lg hover:bg-background"
              >
                <Bookmark className="h-4 w-4" />
              </button>
              <button className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )) || (
          <p className="text-sm text-muted-foreground">No personalized recommendations yet. Complete your profile to get started.</p>
        )}
      </div>
    </div>
  );
}
