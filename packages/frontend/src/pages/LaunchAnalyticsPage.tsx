import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";

export function LaunchAnalyticsPage() {
  const stats = [
    { label: "Sign-ups", value: "1,247", change: "+23%", icon: Users },
    { label: "Revenue", value: "$48,392", change: "+18%", icon: DollarSign },
    { label: "Conversion", value: "4.2%", change: "+0.5%", icon: TrendingUp },
    { label: "Churn", value: "2.1%", change: "-0.3%", icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Launch Analytics</h1>
      <p className="text-muted-foreground">Post-launch metrics and performance tracking</p>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <Badge variant={stat.change.startsWith("+") ? "default" : "secondary"} className="mt-1">{stat.change}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Weekly Trend</CardTitle></CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Analytics chart will be displayed here</div>
        </CardContent>
      </Card>
    </div>
  );
}
