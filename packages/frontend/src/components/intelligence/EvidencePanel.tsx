import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  Database,
  BarChart3,
  History,
  Link2,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  FileCheck,
  Globe,
  Building2,
  Landmark,
  HardHat,
  ArrowUpRight,
} from "lucide-react";

export interface DataSource {
  name: string;
  type: "permit" | "census" | "economic" | "news" | "satellite" | "custom";
  reliability: "high" | "medium" | "low";
  lastUpdated: Date;
}

export interface KeyMetric {
  label: string;
  value: string | number;
  change?: number; // percentage change
  unit?: string;
}

export interface HistoricalContext {
  period: string;
  trend: "up" | "down" | "flat";
  summary: string;
}

export interface RelatedActivity {
  id: string;
  title: string;
  date: Date;
  type: "permit" | "announcement" | "contract" | "milestone";
  url?: string;
}

export interface EvidencePanelProps {
  dataSources?: DataSource[];
  keyMetrics?: KeyMetric[];
  historicalContext?: HistoricalContext[];
  relatedActivity?: RelatedActivity[];
  className?: string;
  defaultOpenSections?: string[];
}

const sourceTypeIcons: Record<DataSource["type"], React.ElementType> = {
  permit: HardHat,
  census: Landmark,
  economic: BarChart3,
  news: Globe,
  satellite: Database,
  custom: FileCheck,
};

const sourceTypeLabels: Record<DataSource["type"], string> = {
  permit: "Permit Data",
  census: "Census Data",
  economic: "Economic Indicators",
  news: "News & Media",
  satellite: "Satellite Imagery",
  custom: "Custom Source",
};

const activityTypeIcons: Record<RelatedActivity["type"], React.ElementType> = {
  permit: HardHat,
  announcement: Globe,
  contract: FileCheck,
  milestone: Building2,
};

function TrendIcon({ trend }: { trend: "up" | "down" | "flat" }) {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

function ReliabilityBadge({ reliability }: { reliability: DataSource["reliability"] }) {
  const config = {
    high: { label: "High", className: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300" },
    medium: { label: "Medium", className: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300" },
    low: { label: "Low", className: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300" },
  };
  return (
    <Badge variant="outline" className={cn("text-[10px] px-1.5 h-4", config[reliability].className)}>
      {config[reliability].label}
    </Badge>
  );
}

function SectionHeader({
  title,
  icon: Icon,
  isOpen,
  count,
}: {
  title: string;
  icon: React.ElementType;
  isOpen: boolean;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-2 py-2">
      <Icon className="h-4 w-4 text-primary" />
      <span className="text-sm font-semibold">{title}</span>
      {count !== undefined && (
        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
          {count}
        </Badge>
      )}
      <div className="ml-auto">
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    </div>
  );
}

export function EvidencePanel({
  dataSources = [],
  keyMetrics = [],
  historicalContext = [],
  relatedActivity = [],
  className,
  defaultOpenSections = ["sources", "metrics"],
}: EvidencePanelProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(defaultOpenSections)
  );

  const toggleSection = (section: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const hasData =
    dataSources.length > 0 ||
    keyMetrics.length > 0 ||
    historicalContext.length > 0 ||
    relatedActivity.length > 0;

  if (!hasData) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6 text-center text-muted-foreground text-sm">
          No evidence data available for this recommendation.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Supporting Evidence</CardTitle>
        </div>
        <CardDescription>
          Data sources, metrics, and context behind this recommendation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {/* Data Sources */}
        {dataSources.length > 0 && (
          <Collapsible
            open={openSections.has("sources")}
            onOpenChange={() => toggleSection("sources")}
          >
            <CollapsibleTrigger asChild>
              <button className="w-full text-left hover:bg-accent/50 rounded-lg px-2 -mx-2 transition-colors">
                <SectionHeader
                  title="Data Sources"
                  icon={Database}
                  isOpen={openSections.has("sources")}
                  count={dataSources.length}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-2 pb-2 pl-6">
                {dataSources.map((source) => {
                  const SourceIcon = sourceTypeIcons[source.type];
                  return (
                    <div
                      key={source.name}
                      className="flex items-center justify-between py-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <SourceIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">{source.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({sourceTypeLabels[source.type]})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ReliabilityBadge reliability={source.reliability} />
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(source.lastUpdated).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CollapsibleContent>
            <Separator />
          </Collapsible>
        )}

        {/* Key Metrics */}
        {keyMetrics.length > 0 && (
          <Collapsible
            open={openSections.has("metrics")}
            onOpenChange={() => toggleSection("metrics")}
          >
            <CollapsibleTrigger asChild>
              <button className="w-full text-left hover:bg-accent/50 rounded-lg px-2 -mx-2 transition-colors">
                <SectionHeader
                  title="Key Metrics"
                  icon={BarChart3}
                  isOpen={openSections.has("metrics")}
                  count={keyMetrics.length}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-2 pl-6">
                {keyMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="p-2.5 rounded-md border bg-card/50"
                  >
                    <div className="text-xs text-muted-foreground mb-0.5">
                      {metric.label}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-bold">
                        {typeof metric.value === "number"
                          ? metric.value.toLocaleString()
                          : metric.value}
                      </span>
                      {metric.unit && (
                        <span className="text-xs text-muted-foreground">
                          {metric.unit}
                        </span>
                      )}
                      {metric.change !== undefined && (
                        <span
                          className={cn(
                            "text-xs font-medium flex items-center gap-0.5",
                            metric.change > 0
                              ? "text-green-600"
                              : metric.change < 0
                              ? "text-red-600"
                              : "text-muted-foreground"
                          )}
                        >
                          {metric.change > 0 ? "+" : ""}
                          {metric.change}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
            <Separator />
          </Collapsible>
        )}

        {/* Historical Context */}
        {historicalContext.length > 0 && (
          <Collapsible
            open={openSections.has("history")}
            onOpenChange={() => toggleSection("history")}
          >
            <CollapsibleTrigger asChild>
              <button className="w-full text-left hover:bg-accent/50 rounded-lg px-2 -mx-2 transition-colors">
                <SectionHeader
                  title="Historical Context"
                  icon={History}
                  isOpen={openSections.has("history")}
                  count={historicalContext.length}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-2 pb-2 pl-6">
                {historicalContext.map((ctx) => (
                  <div
                    key={ctx.period}
                    className="flex items-start gap-2 py-1"
                  >
                    <TrendIcon trend={ctx.trend} />
                    <div>
                      <span className="text-sm font-medium">{ctx.period}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {ctx.summary}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
            <Separator />
          </Collapsible>
        )}

        {/* Related Activity */}
        {relatedActivity.length > 0 && (
          <Collapsible
            open={openSections.has("activity")}
            onOpenChange={() => toggleSection("activity")}
          >
            <CollapsibleTrigger asChild>
              <button className="w-full text-left hover:bg-accent/50 rounded-lg px-2 -mx-2 transition-colors">
                <SectionHeader
                  title="Related Activity"
                  icon={Link2}
                  isOpen={openSections.has("activity")}
                  count={relatedActivity.length}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-2 pb-2 pl-6">
                {relatedActivity.map((activity) => {
                  const ActivityIcon = activityTypeIcons[activity.type];
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-2 py-1 group"
                    >
                      <ActivityIcon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm truncate">{activity.title}</span>
                          {activity.url && (
                            <a
                              href={activity.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80 shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ArrowUpRight className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                            {activity.type}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(activity.date).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
