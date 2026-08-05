import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { ChevronDown, ChevronUp } from "lucide-react";

interface OpportunityTimelineProps {
  opportunityId: string;
}

export function OpportunityTimeline({ opportunityId }: OpportunityTimelineProps) {
  const [expanded, setExpanded] = useState(false);
  const { data, isLoading } = trpc.opportunity.getTimeline.useQuery({ id: opportunityId });

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (!data || data.events.length === 0) return null;

  const visibleEvents = expanded ? data.events : data.events.slice(0, 3);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Timeline</CardTitle>
          {data.events.length > 3 && (
            <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
              {expanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Show all ({data.events.length})
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Timeline>
          {visibleEvents.map((event, index) => (
            <TimelineItem
              key={index}
              date={event.date}
              title={event.title}
              description={event.description}
              status={event.status as "completed" | "current" | "pending"}
            />
          ))}
        </Timeline>
      </CardContent>
    </Card>
  );
}
