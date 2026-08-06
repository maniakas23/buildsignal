import React from "react";
import { Card } from "@/components/ui/card";
import { DashboardHeader, DashboardTitle } from "@/components/ui-custom/DashboardHeader";
import { useEngine } from "@/kestovar/engine";
import { Empty } from "@/components/ui-custom/EngineStates";

export function SummaryPage() {
  const { data: summary, isLoading } = useEngine();

  const metrics = summary?.metrics || [];
  const content = summary?.content || "";
  const generatedAt = summary?.generatedAt || "";

  return (
    <div className="min-h-screen bg-wash-primary pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <DashboardHeader>
          <DashboardTitle
            title="Weekly Summary"
            subtitle="Highlights and insights from your pipeline"
          />
        </DashboardHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-indigo" />
          </div>
        ) : !content ? (
          <Empty variant="default" title="No summary available" message="Check back next week for your summary" />
        ) : (
          <div className="space-y-6">
            {generatedAt && (
              <p className="text-sm text-ink-tertiary">
                Generated {new Date(generatedAt).toLocaleDateString()}
              </p>
            )}

            <Card className="p-6">
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
            </Card>

            {metrics.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((m: any, i: number) => (
                  <Card key={i} className="p-4">
                    <p className="text-sm text-ink-secondary">{m.label}</p>
                    <p className="text-2xl font-semibold text-ink-primary mt-1">{m.value}</p>
                    {m.change && (
                      <p className={`text-sm mt-1 ${m.change > 0 ? 'text-accent-teal' : 'text-accent-crimson'}`}>
                        {m.change > 0 ? '+' : ''}{m.change}%
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
