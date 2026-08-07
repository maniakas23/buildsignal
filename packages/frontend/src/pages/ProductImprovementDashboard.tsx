import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  TrendingUp,
  MessageSquare,
  Star,
  ArrowUpRight,
  Clock,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";

// Mock data for charts and metrics
const feedbackVolumeData = [
  { month: "Aug", count: 45 },
  { month: "Sep", count: 62 },
  { month: "Oct", count: 58 },
  { month: "Nov", count: 71 },
  { month: "Dec", count: 89 },
  { month: "Jan", count: 94 },
];

const topFeatures = [
  { name: "Mobile App", votes: 342, trend: "up" },
  { name: "More Counties", votes: 287, trend: "up" },
  { name: "CSV Export", votes: 198, trend: "stable" },
  { name: "Zapier Integration", votes: 156, trend: "up" },
  { name: "White-Label Reports", votes: 134, trend: "up" },
  { name: "Slack Alerts", votes: 112, trend: "stable" },
];

const categoryBreakdown = [
  { category: "Bug", count: 124, color: "bg-red-500" },
  { category: "Feature", count: 312, color: "bg-blue-500" },
  { category: "Question", count: 89, color: "bg-green-500" },
  { category: "Complaint", count: 34, color: "bg-amber-500" },
];

const satisfactionTrend = [
  { month: "Aug", score: 3.8 },
  { month: "Sep", score: 3.9 },
  { month: "Oct", score: 4.0 },
  { month: "Nov", score: 4.1 },
  { month: "Dec", score: 4.2 },
  { month: "Jan", score: 4.3 },
];

const recentFeedback = [
  {
    date: "2025-01-15",
    type: "Bug",
    summary: "Reports slow to load on large counties",
    status: "In Progress",
    action: "Assigned to Eng",
  },
  {
    date: "2025-01-14",
    type: "Feature",
    summary: "Need mobile app for field teams",
    status: "Planned",
    action: "Product Review",
  },
  {
    date: "2025-01-13",
    type: "Question",
    summary: "How to export watchlist to CSV?",
    status: "Resolved",
    action: "Docs Updated",
  },
  {
    date: "2025-01-12",
    type: "Complaint",
    summary: "King County data seems outdated",
    status: "Under Review",
    action: "Data Team",
  },
  {
    date: "2025-01-11",
    type: "Feature",
    summary: "Zapier integration would save hours",
    status: "Planned",
    action: "Roadmap Q2",
  },
  {
    date: "2025-01-10",
    type: "Bug",
    summary: "Dashboard widgets not resizable",
    status: "In Progress",
    action: "Assigned to Eng",
  },
];

const statusColors: Record<string, string> = {
  "In Progress": "bg-blue-100 text-blue-700",
  Planned: "bg-purple-100 text-purple-700",
  Resolved: "bg-green-100 text-green-700",
  "Under Review": "bg-amber-100 text-amber-700",
};

const typeColors: Record<string, string> = {
  Bug: "bg-red-50 text-red-700 border-red-200",
  Feature: "bg-blue-50 text-blue-700 border-blue-200",
  Question: "bg-green-50 text-green-700 border-green-200",
  Complaint: "bg-amber-50 text-amber-700 border-amber-200",
};

export function ProductImprovementDashboard() {
  const [timeRange, setTimeRange] = useState("6m");

  const maxVolume = Math.max(...feedbackVolumeData.map((d) => d.count));
  const maxSatisfaction = 5;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Product Improvement</h1>
          <p className="text-sm text-muted-foreground">
            Customer feedback pipeline and satisfaction metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          {["1m", "3m", "6m", "1y"].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === "1m" ? "1M" : range === "3m" ? "3M" : range === "6m" ? "6M" : "1Y"}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">559</div>
              <div className="text-xs text-muted-foreground">Total Feedback</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-green-100 flex items-center justify-center">
              <Star className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">4.3</div>
              <div className="text-xs text-muted-foreground">Avg. Satisfaction</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">12</div>
              <div className="text-xs text-muted-foreground">Open Bugs</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center">
              <Lightbulb className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">8</div>
              <div className="text-xs text-muted-foreground">In Development</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Feedback Volume */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Customer Feedback Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-40">
              {feedbackVolumeData.map((d) => (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="text-[10px] text-muted-foreground">{d.count}</div>
                  <div
                    className="w-full bg-primary/80 rounded-t-sm transition-all hover:bg-primary"
                    style={{ height: `${(d.count / maxVolume) * 100}%` }}
                  />
                  <div className="text-[10px] text-muted-foreground font-medium">
                    {d.month}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Satisfaction Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Customer Satisfaction Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-40">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[5, 4, 3, 2, 1].map((n) => (
                  <div key={n} className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-3">{n}</span>
                    <div className="flex-1 h-px bg-muted" />
                  </div>
                ))}
              </div>
              {/* Line */}
              <div className="absolute inset-0 pl-5 pt-1 pb-4">
                <svg className="w-full h-full" preserveAspectRatio="none">
                  <polyline
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    points={satisfactionTrend
                      .map(
                        (d, i) =>
                          `${(i / (satisfactionTrend.length - 1)) * 100},${100 - (d.score / maxSatisfaction) * 100}`
                      )
                      .join(" ")}
                  />
                  {satisfactionTrend.map((d, i) => (
                    <circle
                      key={i}
                      cx={`${(i / (satisfactionTrend.length - 1)) * 100}%`}
                      cy={`${100 - (d.score / maxSatisfaction) * 100}%`}
                      r="3"
                      fill="hsl(var(--primary))"
                    />
                  ))}
                </svg>
              </div>
              {/* X-axis labels */}
              <div className="absolute bottom-0 left-5 right-0 flex justify-between text-[10px] text-muted-foreground">
                {satisfactionTrend.map((d) => (
                  <span key={d.month}>{d.month}</span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Requested Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-primary" />
              Top Requested Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topFeatures.map((feature, i) => (
              <div key={feature.name} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-4">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{feature.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {feature.votes} votes
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{
                        width: `${(feature.votes / topFeatures[0].votes) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Feedback by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Feedback by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryBreakdown.map((cat) => {
              const total = categoryBreakdown.reduce((s, c) => s + c.count, 0);
              const pct = (cat.count / total) * 100;
              return (
                <div key={cat.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{cat.category}</span>
                    <span className="text-muted-foreground">
                      {cat.count} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${cat.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Recent Feedback Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Recent Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs">Summary</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentFeedback.map((item) => (
                <TableRow key={item.date + item.summary}>
                  <TableCell className="text-xs">{item.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${typeColors[item.type] || ""}`}
                    >
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs max-w-[200px] truncate">
                    {item.summary}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${statusColors[item.status] || ""}`}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {item.action}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
