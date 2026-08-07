import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Lightbulb,
  Gauge,
  Clock,
  MapPin,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface CustomerSuccessMetricsProps {
  reportsGeneratedThisMonth?: number;
  opportunitiesDiscovered?: number;
  averageConfidenceScore?: number;
  dataFreshnessHours?: number;
  marketsTracked?: number;
  className?: string;
}

function formatFreshness(hours: number): string {
  if (hours < 1) return "Updated just now";
  if (hours < 24) return `Updated ${Math.round(hours)} hours ago`;
  const days = Math.round(hours / 24);
  return `Updated ${days} day${days > 1 ? "s" : ""} ago`;
}

function freshnessColor(hours: number): string {
  if (hours < 6) return "text-green-600 bg-green-50 border-green-200";
  if (hours <= 24) return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-red-600 bg-red-50 border-red-200";
}

function freshnessIconColor(hours: number): string {
  if (hours < 6) return "text-green-500";
  if (hours <= 24) return "text-amber-500";
  return "text-red-500";
}

export function CustomerSuccessMetrics({
  reportsGeneratedThisMonth = 0,
  opportunitiesDiscovered = 0,
  averageConfidenceScore = 0,
  dataFreshnessHours = 0,
  marketsTracked = 0,
  className,
}: CustomerSuccessMetricsProps) {
  const metrics = [
    {
      label: "Reports Generated This Month",
      value: reportsGeneratedThisMonth,
      icon: FileText,
      suffix: "",
      trend: reportsGeneratedThisMonth > 0 ? "up" as const : "neutral" as const,
      description: "Intelligence reports created",
    },
    {
      label: "Opportunities Discovered",
      value: opportunitiesDiscovered,
      icon: Lightbulb,
      suffix: "",
      trend: opportunitiesDiscovered > 0 ? "up" as const : "neutral" as const,
      description: "New signals found",
    },
    {
      label: "Average Confidence Score",
      value: averageConfidenceScore,
      icon: Gauge,
      suffix: "%",
      showProgress: true,
      progressColor:
        averageConfidenceScore >= 90
          ? "bg-green-500"
          : averageConfidenceScore >= 70
          ? "bg-amber-500"
          : "bg-red-500",
      description: "Overall recommendation quality",
    },
    {
      label: "Data Freshness",
      value: formatFreshness(dataFreshnessHours),
      icon: Clock,
      suffix: "",
      isBadge: true,
      badgeClass: freshnessColor(dataFreshnessHours),
      description: "Last data refresh",
    },
    {
      label: "Markets Tracked",
      value: marketsTracked,
      icon: MapPin,
      suffix: " counties",
      trend: marketsTracked > 0 ? "up" as const : "neutral" as const,
      description: "Active watchlist coverage",
    },
  ];

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Success Metrics</CardTitle>
        <CardDescription>Track your platform usage and intelligence quality</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className="p-4 rounded-lg border bg-card hover:bg-accent/20 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {metric.label}
                    </span>
                  </div>
                  {metric.trend && metric.trend !== "neutral" && (
                    <div
                      className={cn(
                        "flex items-center gap-0.5 text-xs",
                        metric.trend === "up" ? "text-green-600" : "text-red-600"
                      )}
                    >
                      {metric.trend === "up" ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-1">
                  {metric.isBadge ? (
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-sm font-semibold px-2.5 py-0.5",
                        metric.badgeClass
                      )}
                    >
                      <Clock className={cn("h-3 w-3 mr-1", freshnessIconColor(dataFreshnessHours))} />
                      {metric.value}
                    </Badge>
                  ) : (
                    <div className="text-2xl font-bold">
                      {typeof metric.value === "number"
                        ? metric.value.toLocaleString()
                        : metric.value}
                      {metric.suffix && (
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          {metric.suffix}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {metric.showProgress && typeof metric.value === "number" && (
                  <div className="mt-2">
                    <Progress
                      value={Math.min(Math.max(metric.value, 0), 100)}
                      className="h-1.5"
                    />
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-1.5">{metric.description}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
