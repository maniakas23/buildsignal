import { useState } from "react";
import { Lightbulb, Check, X, Bookmark, ArrowRight } from "lucide-react";
import { trpc } from "@/providers/trpc";

export function RecommendationsPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("confidence");

  const recommendations = trpc.recommendation.list.useQuery({ status: status as any });
  const summary = trpc.recommendation.summary.useQuery();
  const save = trpc.recommendation.save.useMutation({
    onSuccess: () => recommendations.refetch(),
  });
  const dismiss = trpc.recommendation.dismiss.useMutation({
    onSuccess: () => recommendations.refetch(),
  });
  const act = trpc.recommendation.act.useMutation({
    onSuccess: () => recommendations.refetch(),
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Recommendations</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 border rounded-lg bg-card">
          <div className="text-sm text-muted-foreground">Total</div>
          <div className="text-2xl font-bold">{summary.data?.total || 0}</div>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <div className="text-sm text-muted-foreground">New</div>
          <div className="text-2xl font-bold text-blue-500">{summary.data?.new || 0}</div>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <div className="text-sm text-muted-foreground">Saved</div>
          <div className="text-2xl font-bold text-yellow-500">{summary.data?.saved || 0}</div>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <div className="text-sm text-muted-foreground">Acted</div>
          <div className="text-2xl font-bold text-green-500">{summary.data?.acted || 0}</div>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <select
          value={status || ""}
          onChange={(e) => setStatus(e.target.value || null)}
          className="rounded-lg border border-input bg-background px-4 py-2 text-sm"
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="saved">Saved</option>
          <option value="dismissed">Dismissed</option>
          <option value="acted">Acted</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-lg border border-input bg-background px-4 py-2 text-sm"
        >
          <option value="confidence">Confidence</option>
          <option value="date">Date</option>
          <option value="type">Type</option>
        </select>
      </div>

      <div className="space-y-4">
        {recommendations.data?.recommendations?.map((rec) => (
          <div key={rec.id} className="p-4 border rounded-lg bg-card">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-yellow-500 mt-1" />
                <div>
                  <h3 className="font-semibold">{rec.countyName}, {rec.state}</h3>
                  <p className="text-sm text-muted-foreground">{rec.summary}</p>
                  <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
                    <span>{rec.type}</span>
                    <span>Confidence: {rec.confidence}%</span>
                    <span>{rec.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {rec.status === "new" && (
                  <button
                    onClick={() => save.mutate({ id: rec.id })}
                    className="rounded-lg border border-input px-3 py-1 text-xs hover:bg-accent"
                  >
                    <Bookmark className="h-3 w-3" />
                  </button>
                )}
                {rec.status !== "dismissed" && rec.status !== "acted" && (
                  <button
                    onClick={() => dismiss.mutate({ id: rec.id })}
                    className="rounded-lg border border-input px-3 py-1 text-xs hover:bg-accent"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
                {rec.status === "new" || rec.status === "saved" ? (
                  <button
                    onClick={() => act.mutate({ id: rec.id })}
                    className="rounded-lg bg-primary px-3 py-1 text-xs text-primary-foreground hover:bg-primary/90"
                  >
                    <ArrowRight className="h-3 w-3" />
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ))}
        {recommendations.data?.recommendations?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Lightbulb className="mx-auto h-12 w-12 mb-4" />
            <p>No recommendations available</p>
            <p className="text-sm">The Kestovar engine is analyzing your markets</p>
          </div>
        )}
      </div>
    </div>
  );
}
