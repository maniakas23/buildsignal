import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { Calendar, Clock } from "lucide-react";

export function WorkspaceTimeline() {
  const { data, isLoading } = trpc.opportunity.list.useQuery({ limit: 20 });

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  const events = data?.items?.map((opp, index) => ({
    date: opp.createdAt || new Date().toISOString(),
    title: opp.title,
    description: `${opp.county}, ${opp.state} — ${opp.confidence}% confidence`,
    status: (index === 0 ? "current" : "completed") as "completed" | "current" | "pending",
  })) || [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Opportunity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.length > 0 ? (
            <Timeline>
              {events.slice(0, 10).map((event, index) => (
                <TimelineItem
                  key={index}
                  date={event.date}
                  title={event.title}
                  description={event.description}
                  status={event.status}
                />
              ))}
            </Timeline>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No timeline events</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
