import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useEngine } from "@/kestovar/engine";
import { DashboardHeader, DashboardTitle } from "@/components/ui-custom/DashboardHeader";

export function OpportunityPortfolio() {
  const navigate = useNavigate();
  const { data: portfolio = [], isLoading } = useEngine();

  const [filter, setFilter] = useState<"all" | "active" | "won" | "lost">("all");

  const filtered = (portfolio as any[] || []).filter((item: any) => {
    if (filter === "all") return true;
    if (filter === "active") return item.status === "active" || item.status === "open";
    if (filter === "won") return item.status === "won" || item.status === "awarded";
    if (filter === "lost") return item.status === "lost" || item.status === "rejected";
    return true;
  });

  return (
    <div className="min-h-screen bg-wash-primary pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DashboardHeader>
          <DashboardTitle
            title="Opportunity Portfolio"
            subtitle="Track all your tracked opportunities in one place"
          />
        </DashboardHeader>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setFilter("all")}>All</TabsTrigger>
            <TabsTrigger value="active" onClick={() => setFilter("active")}>Active</TabsTrigger>
            <TabsTrigger value="won" onClick={() => setFilter("won")}>Won</TabsTrigger>
            <TabsTrigger value="lost" onClick={() => setFilter("lost")}>Lost</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-indigo" />
              </div>
            ) : filtered.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-ink-secondary">No opportunities in this category</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate("/search")}
                >
                  Find Opportunities
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((item: any) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-ink-primary">{item.title || item.name || "Untitled"}</h3>
                        <p className="text-sm text-ink-secondary mt-1">{item.agency || item.source || ""}</p>
                      </div>
                      <Badge variant={item.status === "active" || item.status === "open" ? "default" : item.status === "won" || item.status === "awarded" ? "secondary" : "outline"}>
                        {item.status || "unknown"}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-sm text-ink-secondary">
                      {item.value && <span>Value: ${item.value.toLocaleString()}</span>}
                      {item.deadline && <span>Due: {new Date(item.deadline).toLocaleDateString()}</span>}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
