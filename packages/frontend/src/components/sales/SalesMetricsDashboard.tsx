import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  UserPlus,
  Percent,
  DollarSign,
  Building2,
  BarChart3,
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  trend?: number;
  trendLabel?: string;
  icon: React.ElementType;
  color: "blue" | "green" | "amber" | "purple";
}

function MetricCard({ title, value, trend, trendLabel, icon: Icon, color }: MetricCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400",
    green: "bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400",
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {trend !== undefined && (
              <div className="flex items-center gap-1.5">
                {trend >= 0 ? (
                  <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                )}
                <span
                  className={`text-xs font-medium ${
                    trend >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {trend >= 0 ? "+" : ""}
                  {trend}%
                </span>
                {trendLabel && (
                  <span className="text-xs text-muted-foreground">{trendLabel}</span>
                )}
              </div>
            )}
          </div>
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SalesMetricsDashboard() {
  const metrics = [
    {
      title: "Website Visitors Today",
      value: "2,847",
      trend: 12.5,
      trendLabel: "vs yesterday",
      icon: Users,
      color: "blue" as const,
    },
    {
      title: "Demo Requests This Week",
      value: "34",
      trend: 8.3,
      trendLabel: "vs last week",
      icon: Calendar,
      color: "green" as const,
    },
    {
      title: "Free Trial Signups",
      value: "127",
      trend: 15.2,
      trendLabel: "vs last week",
      icon: UserPlus,
      color: "purple" as const,
    },
    {
      title: "Conversion Rate",
      value: "4.6%",
      trend: -0.8,
      trendLabel: "vs last week",
      icon: Percent,
      color: "amber" as const,
    },
    {
      title: "MRR",
      value: "$48,250",
      trend: 6.4,
      trendLabel: "vs last month",
      icon: DollarSign,
      color: "green" as const,
    },
    {
      title: "Active Customers",
      value: "312",
      trend: 5.1,
      trendLabel: "vs last month",
      icon: Building2,
      color: "blue" as const,
    },
  ];

  const pipelineStages = [
    { stage: "New Leads", count: 156, color: "bg-blue-500" },
    { stage: "Qualified", count: 89, color: "bg-purple-500" },
    { stage: "Demo Scheduled", count: 34, color: "bg-amber-500" },
    { stage: "Trial Active", count: 52, color: "bg-orange-500" },
    { stage: "Closed Won", count: 18, color: "bg-green-500" },
  ];

  const maxPipeline = Math.max(...pipelineStages.map((s) => s.count));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sales Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Real-time pipeline and revenue metrics
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          <BarChart3 className="h-3 w-3 mr-1" />
          Live Data
        </Badge>
      </div>

      <Separator />

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      <Separator />

      {/* Pipeline Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sales Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pipelineStages.map((stage) => (
              <div key={stage.stage} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{stage.stage}</span>
                  <span className="text-muted-foreground">{stage.count}</span>
                </div>
                <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${stage.color} rounded-full transition-all duration-500`}
                    style={{ width: `${(stage.count / maxPipeline) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
