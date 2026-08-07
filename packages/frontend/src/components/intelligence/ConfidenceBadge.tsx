import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import { ShieldCheck, ShieldAlert, Shield } from "lucide-react";

export interface ConfidenceBadgeProps {
  score: number;
  explanation?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

type ConfidenceLevel = "high" | "medium" | "low";

function getConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= 90) return "high";
  if (score >= 70) return "medium";
  return "low";
}

function getLevelConfig(level: ConfidenceLevel) {
  switch (level) {
    case "high":
      return {
        label: "High Confidence",
        badgeClass:
          "bg-green-100 text-green-800 border-green-300 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
        icon: ShieldCheck,
        iconColor: "text-green-600",
        barColor: "bg-green-500",
        description:
          "This recommendation is backed by strong, multi-source evidence with high correlation across data points.",
      };
    case "medium":
      return {
        label: "Medium Confidence",
        badgeClass:
          "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
        icon: Shield,
        iconColor: "text-amber-600",
        barColor: "bg-amber-500",
        description:
          "This recommendation has solid supporting evidence, but may benefit from additional verification or context.",
      };
    case "low":
      return {
        label: "Low Confidence",
        badgeClass:
          "bg-red-100 text-red-800 border-red-300 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
        icon: ShieldAlert,
        iconColor: "text-red-600",
        barColor: "bg-red-500",
        description:
          "This recommendation has limited supporting evidence. Consider it as a starting point for further investigation.",
      };
  }
}

export function ConfidenceBadge({
  score,
  explanation,
  size = "md",
  showIcon = true,
  className,
}: ConfidenceBadgeProps) {
  const clampedScore = Math.min(Math.max(score, 0), 100);
  const level = getConfidenceLevel(clampedScore);
  const config = getLevelConfig(level);
  const Icon = config.icon;

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

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Badge
          variant="outline"
          className={cn(
            "cursor-help font-semibold inline-flex items-center",
            config.badgeClass,
            sizeClasses[size],
            className
          )}
        >
          {showIcon && <Icon className={cn(iconSizes[size], config.iconColor)} />}
          <span>{config.label}</span>
          <span className="opacity-70 ml-0.5">{clampedScore}%</span>
        </Badge>
      </HoverCardTrigger>
      <HoverCardContent className="w-72 p-4" side="top">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Icon className={cn("h-5 w-5", config.iconColor)} />
            <span className="font-semibold text-sm">{config.label}</span>
          </div>

          {/* Score bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Confidence Score</span>
              <span className="font-medium">{clampedScore}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", config.barColor)}
                style={{ width: `${clampedScore}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            {explanation || config.description}
          </p>

          <div className="flex gap-2 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>90-100%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <span>70-89%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span>&lt;70%</span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
