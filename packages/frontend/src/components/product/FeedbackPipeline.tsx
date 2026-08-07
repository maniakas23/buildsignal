import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, ArrowRight } from "lucide-react";

type PipelineStage =
  | "new"
  | "under-review"
  | "planned"
  | "in-development"
  | "shipped";

type FeedbackCategory = "Bug" | "Feature" | "Question" | "Complaint" | "General";
type Priority = "Low" | "Medium" | "High" | "Critical";

interface FeedbackItem {
  id: string;
  text: string;
  category: FeedbackCategory;
  customer: string;
  date: string;
  priority: Priority;
  stage: PipelineStage;
}

const mockFeedback: FeedbackItem[] = [
  {
    id: "FB-001",
    text: "Reports take too long to load on large counties",
    category: "Bug",
    customer: "Customer A",
    date: "2025-01-15",
    priority: "High",
    stage: "in-development",
  },
  {
    id: "FB-002",
    text: "Need mobile app for field teams",
    category: "Feature",
    customer: "Customer B",
    date: "2025-01-14",
    priority: "Medium",
    stage: "planned",
  },
  {
    id: "FB-003",
    text: "How do I export watchlist to CSV?",
    category: "Question",
    customer: "Customer C",
    date: "2025-01-13",
    priority: "Low",
    stage: "shipped",
  },
  {
    id: "FB-004",
    text: "Data for King County seems outdated",
    category: "Complaint",
    customer: "Customer D",
    date: "2025-01-12",
    priority: "High",
    stage: "under-review",
  },
  {
    id: "FB-005",
    text: "Zapier integration would save us hours",
    category: "Feature",
    customer: "Customer E",
    date: "2025-01-11",
    priority: "Medium",
    stage: "new",
  },
  {
    id: "FB-006",
    text: "Dashboard widgets should be resizable",
    category: "Feature",
    customer: "Customer F",
    date: "2025-01-10",
    priority: "Low",
    stage: "in-development",
  },
  {
    id: "FB-007",
    text: "Login session expires too quickly",
    category: "Bug",
    customer: "Customer G",
    date: "2025-01-09",
    priority: "Critical",
    stage: "under-review",
  },
  {
    id: "FB-008",
    text: "Great tool, but need white-label reports",
    category: "Feature",
    customer: "Customer H",
    date: "2025-01-08",
    priority: "Medium",
    stage: "planned",
  },
  {
    id: "FB-009",
    text: "Can you add Slack notifications?",
    category: "Feature",
    customer: "Customer I",
    date: "2025-01-07",
    priority: "Low",
    stage: "shipped",
  },
  {
    id: "FB-010",
    text: "Search is not finding all counties",
    category: "Bug",
    customer: "Customer J",
    date: "2025-01-06",
    priority: "High",
    stage: "new",
  },
];

const stageConfig: Record<
  PipelineStage,
  { label: string; color: string; badgeVariant: "default" | "secondary" | "outline" | "destructive" }
> = {
  new: { label: "New Feedback", color: "border-l-4 border-l-blue-500", badgeVariant: "default" },
  "under-review": { label: "Under Review", color: "border-l-4 border-l-amber-500", badgeVariant: "secondary" },
  planned: { label: "Planned", color: "border-l-4 border-l-purple-500", badgeVariant: "secondary" },
  "in-development": { label: "In Development", color: "border-l-4 border-l-primary", badgeVariant: "default" },
  shipped: { label: "Shipped", color: "border-l-4 border-l-green-500", badgeVariant: "outline" },
};

const priorityColors: Record<Priority, string> = {
  Low: "bg-slate-100 text-slate-700",
  Medium: "bg-blue-100 text-blue-700",
  High: "bg-amber-100 text-amber-700",
  Critical: "bg-red-100 text-red-700",
};

const categoryColors: Record<FeedbackCategory, string> = {
  Bug: "bg-red-50 text-red-700 border-red-200",
  Feature: "bg-blue-50 text-blue-700 border-blue-200",
  Question: "bg-green-50 text-green-700 border-green-200",
  Complaint: "bg-amber-50 text-amber-700 border-amber-200",
  General: "bg-slate-50 text-slate-700 border-slate-200",
};

const stages: PipelineStage[] = [
  "new",
  "under-review",
  "planned",
  "in-development",
  "shipped",
];

export function FeedbackPipeline() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const filteredFeedback = mockFeedback.filter((item) => {
    const catMatch = categoryFilter === "all" || item.category === categoryFilter;
    const priMatch = priorityFilter === "all" || item.priority === priorityFilter;
    return catMatch && priMatch;
  });

  const stageCounts = stages.reduce(
    (acc, stage) => {
      acc[stage] = filteredFeedback.filter((f) => f.stage === stage).length;
      return acc;
    },
    {} as Record<PipelineStage, number>
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Filter by:</span>
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Bug">Bug</SelectItem>
            <SelectItem value="Feature">Feature</SelectItem>
            <SelectItem value="Question">Question</SelectItem>
            <SelectItem value="Complaint">Complaint</SelectItem>
            <SelectItem value="General">General</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Pipeline Columns */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        {stages.map((stage) => {
          const items = filteredFeedback.filter((f) => f.stage === stage);
          return (
            <div key={stage} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  {stageConfig[stage].label}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {stageCounts[stage]}
                </Badge>
              </div>
              <div className="space-y-2 min-h-[100px]">
                {items.map((item) => (
                  <Card
                    key={item.id}
                    className={`${stageConfig[stage].color} hover:shadow-md transition-shadow cursor-pointer`}
                  >
                    <CardContent className="p-3 space-y-2">
                      <p className="text-xs leading-relaxed line-clamp-3">
                        {item.text}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 ${categoryColors[item.category]}`}
                        >
                          {item.category}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 ${priorityColors[item.priority]}`}
                        >
                          {item.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>{item.customer}</span>
                        <span>{item.date}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {items.length === 0 && (
                  <div className="text-center py-4 text-xs text-muted-foreground border border-dashed rounded-lg">
                    No items
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stage Flow Indicator */}
      <div className="hidden lg:flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
        {stages.map((stage, i) => (
          <div key={stage} className="flex items-center gap-2">
            <span className="font-medium">{stageConfig[stage].label}</span>
            {i < stages.length - 1 && <ArrowRight className="h-3 w-3" />}
          </div>
        ))}
      </div>
    </div>
  );
}
