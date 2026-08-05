import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";

export function WorkspaceHistorical() {
  const { data, isLoading } = trpc.historical.getValidationMetrics.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data) return <p className="text-muted-foreground">No historical data available</p>;

  const metrics = [
    { label: "Accuracy Rate", value: `${data.accuracy}%`, icon: TrendingUp, trend: data.accuracy > 80 ? "up" : "down" },
    { label: "Precision", value: `${data.precision}%`, icon: TrendingUp, trend: "neutral" },
    { label: "Recall", value: `${data.recall}%`, icon: TrendingDown, trend: data.recall > 75 ? "up" : "down" },
    { label: "F1 Score", value: `${data.f1Score}%`, icon: TrendingUp, trend: "neutral" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                <metric.icon className={`h-4 w-4 ${metric.trend === "up" ? "text-green-500" : metric.trend === "down" ? "text-red-500" : "text-muted-foreground"}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Historical Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Historical accuracy metrics based on prediction validation against actual permit data. 
            Updated daily with new permit filings.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
