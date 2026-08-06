import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  useEngineRecommendations,
  useEngineHealth,
} from "@/kestovar/engine";
import { DashboardHeader, DashboardTitle, DashboardSection } from "@/components/ui-custom/DashboardHeader";
import { RecommendationCard } from "@/components/ui-custom/RecommendationCard";
import { ProgressBar } from "@/components/ui-custom/ProgressBar";

export function OpportunityDashboard() {
  const navigate = useNavigate();
  const { data: recommendations = [], isLoading: recsLoading } = useEngineRecommendations();
  const { data: health } = useEngineHealth();

  const [sortBy, setSortBy] = useState<"score" | "date" | "status">("score");

  const sortedRecs = (recommendations || []).sort((a: any, b: any) => {
    if (sortBy === "score") return (b.matchScore || 0) - (a.matchScore || 0);
    if (sortBy === "date") return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    return (a.status || "").localeCompare(b.status || "");
  });

  const recs = sortedRecs.map((r: any) => ({
    id: r.id,
    projectId: r.projectId,
    projectName: r.projectName || "Unknown Project",
    description: r.description || "",
    matchScore: r.matchScore || 0,
    deadline: r.deadline,
    status: (r.status as "open" | "submitted" | "awarded" | "rejected") || "open",
    value: r.estimatedValue || r.value,
    agency: r.agency || r.source,
    naics: r.naicsCode || r.naics,
    createdAt: r.createdAt,
    type: (r.type as "competitive" | "sole-source" | "set-aside") || "competitive",
    setAside: r.setAside,
  }));

  return (
    <div className="min-h-screen bg-wash-primary pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DashboardHeader>
          <DashboardTitle
            title="Opportunity Dashboard"
            subtitle="Track and manage your government contracting opportunities"
          />
        </DashboardHeader>

        <Tabs defaultValue="recommendations" className="space-y-6">
          <TabsList>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-ink-secondary">Sort by:</span>
                <select
                  className="text-sm border rounded px-2 py-1"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <option value="score">Match Score</option>
                  <option value="date">Date</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>

            {recsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-indigo" />
              </div>
            ) : recs.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-ink-secondary">No recommendations yet</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate("/search")}
                >
                  Search Opportunities
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recs.map((rec) => (
                  <RecommendationCard key={rec.id} {...rec} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pipeline" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Pipeline Overview</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-ink-secondary">Open Opportunities</span>
                    <span className="font-medium">
                      {recs.filter((r: any) => r.status === "open").length}
                    </span>
                  </div>
                  <ProgressBar
                    value={recs.filter((r: any) => r.status === "open").length}
                    max={Math.max(recs.length, 1)}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-ink-secondary">Submitted</span>
                    <span className="font-medium">
                      {recs.filter((r: any) => r.status === "submitted").length}
                    </span>
                  </div>
                  <ProgressBar
                    value={recs.filter((r: any) => r.status === "submitted").length}
                    max={Math.max(recs.length, 1)}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-ink-secondary">Awarded</span>
                    <span className="font-medium">
                      {recs.filter((r: any) => r.status === "awarded").length}
                    </span>
                  </div>
                  <ProgressBar
                    value={recs.filter((r: any) => r.status === "awarded").length}
                    max={Math.max(recs.length, 1)}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            <Card className="p-8 text-center">
              <p className="text-ink-secondary">Save opportunities to see them here</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate("/search")}
              >
                Browse Opportunities
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
