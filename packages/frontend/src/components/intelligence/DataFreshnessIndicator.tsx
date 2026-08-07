import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import { Clock, RefreshCw, AlertTriangle } from "lucide-react";

export interface DataFreshnessIndicatorProps {
  lastUpdated: Date;
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

interface FreshnessConfig {
  label: string;
  badgeClass: string;
  iconColor: string;
  severity: "fresh" | "stale" | "expired";
}

function getFreshnessConfig(hours: number): FreshnessConfig {
  if (hours < 1) {
    return {
      label: "Updated just now",
      badgeClass:
        "bg-green-100 text-green-800 border-green-300 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
      iconColor: "text-green-500",
      severity: "fresh",
    };
  }
  if (hours < 6) {
    return {
      label: `Updated ${Math.round(hours)} hours ago`,
      badgeClass:
        "bg-green-100 text-green-800 border-green-300 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
      iconColor: "text-green-500",
      severity: "fresh",
    };
  }
  if (hours <= 24) {
    return {
      label: `Updated ${Math.round(hours)} hours ago`,
      badgeClass:
        "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
      iconColor: "text-amber-500",
      severity: "stale",
    };
  }
  const days = Math.round(hours / 24);
  return {
    label: `Updated ${days} day${days > 1 ? "s" : ""} ago`,
    badgeClass:
      "bg-red-100 text-red-800 border-red-300 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
    iconColor: "text-red-500",
    severity: "expired",
  };
}

export function DataFreshnessIndicator({
  lastUpdated,
  className,
  showIcon = true,
  size = "md",
}: DataFreshnessIndicatorProps) {
  const now = new Date();
  const diffMs = now.getTime() - new Date(lastUpdated).getTime();
  const hours = diffMs / (1000 * 60 * 60);

  const config = getFreshnessConfig(hours);

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0 h-5 gap-1",
    md: "text-xs px-2.5 py-0.5 h-6 gap-1.5",
    lg: "text-sm px-3 py-1 h-7 gap-1.5",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  const nextRefresh = hours < 6
    ? "Data is current. Next refresh within 6 hours."
    : hours <= 24
    ? "Data is aging. Refresh recommended for accuracy."
    : "Data is significantly outdated. Please refresh for reliable insights.";

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Badge
          variant="outline"
          className={cn(
            "cursor-help font-medium inline-flex items-center",
            config.badgeClass,
            sizeClasses[size],
            className
          )}
        >
          {showIcon && (
            <Clock className={cn(iconSizes[size], config.iconColor)} />
          )}
          <span>{config.label}</span>
        </Badge>
      </HoverCardTrigger>
      <HoverCardContent className="w-64 p-4" side="top">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {config.severity === "expired" ? (
              <AlertTriangle className={cn("h-5 w-5", config.iconColor)} />
            ) : (
              <RefreshCw className={cn("h-5 w-5", config.iconColor)} />
            )}
            <span className="font-semibold text-sm">Data Freshness</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Last updated</span>
              <span className="font-medium">
                {new Date(lastUpdated).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Age</span>
              <span className="font-medium">
                {hours < 1
                  ? "< 1 hour"
                  : hours < 24
                  ? `${Math.round(hours)} hours`
                  : `${Math.round(hours / 24)} days`}
              </span>
            </div>
          </div>

          {/* Freshness bar */}
          <div className="space-y-1">
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  config.severity === "fresh"
                    ? "bg-green-500"
                    : config.severity === "stale"
                    ? "bg-amber-500"
                    : "bg-red-500"
                )}
                style={{
                  width: `${Math.min(Math.max(100 - (hours / 48) * 100, 5), 100)}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Fresh</span>
              <span>Stale</span>
              <span>Expired</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            {nextRefresh}
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
