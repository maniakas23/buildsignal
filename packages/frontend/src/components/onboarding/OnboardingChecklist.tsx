import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  MapPin,
  FileText,
  Bell,
  Users,
  Check,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  ctaLabel: string;
  completed: boolean;
}

export interface OnboardingChecklistProps {
  steps?: OnboardingStep[];
  completedStepIds?: number[];
  onStepClick?: (step: OnboardingStep) => void;
  className?: string;
}

const defaultSteps: Omit<OnboardingStep, "completed">[] = [
  {
    id: 1,
    title: "Complete your profile",
    description: "Add your company details, role, and preferences to personalize your experience.",
    icon: User,
    path: "/settings",
    ctaLabel: "Go to Settings",
  },
  {
    id: 2,
    title: "Select your markets",
    description: "Choose the counties and regions you want to track for opportunities.",
    icon: MapPin,
    path: "/watchlist",
    ctaLabel: "Choose Markets",
  },
  {
    id: 3,
    title: "Generate your first report",
    description: "Run an intelligence report to see opportunities in your selected markets.",
    icon: FileText,
    path: "/reports",
    ctaLabel: "Create Report",
  },
  {
    id: 4,
    title: "Set up alerts",
    description: "Configure alerts so you never miss a new opportunity or market shift.",
    icon: Bell,
    path: "/alerts",
    ctaLabel: "Configure Alerts",
  },
  {
    id: 5,
    title: "Invite your team",
    description: "Collaborate with colleagues by inviting them to your BuildSignal workspace.",
    icon: Users,
    path: "/settings",
    ctaLabel: "Invite Team",
  },
];

export function OnboardingChecklist({
  steps: propSteps,
  completedStepIds = [],
  onStepClick,
  className,
}: OnboardingChecklistProps) {
  const navigate = useNavigate();

  const steps = useMemo(() => {
    const base = propSteps || defaultSteps;
    return base.map((step) => ({
      ...step,
      completed: completedStepIds.includes(step.id),
    }));
  }, [propSteps, completedStepIds]);

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  const handleStepClick = (step: OnboardingStep) => {
    if (onStepClick) {
      onStepClick(step);
    } else {
      navigate(step.path);
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Getting Started</CardTitle>
            <CardDescription>
              Complete these steps to get the most out of BuildSignal
            </CardDescription>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {completedCount}/{steps.length} Done
          </Badge>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>Onboarding progress</span>
            <span className="font-medium">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = step.completed;
          const isNext = !isCompleted && (idx === 0 || steps[idx - 1].completed);

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-all",
                isCompleted
                  ? "bg-green-50/50 border-green-200/60"
                  : isNext
                  ? "border-primary/30 bg-primary/5 ring-1 ring-primary/10"
                  : "border-border bg-card hover:bg-accent/30"
              )}
            >
              {/* Icon / Check circle */}
              <div
                className={cn(
                  "h-9 w-9 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isNext
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4
                    className={cn(
                      "font-semibold text-sm",
                      isCompleted && "text-green-700 line-through decoration-green-400/50"
                    )}
                  >
                    {step.title}
                  </h4>
                  {isCompleted && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 h-4 border-green-300 text-green-700 bg-green-50"
                    >
                      Completed
                    </Badge>
                  )}
                  {isNext && !isCompleted && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 h-4 border-primary/40 text-primary bg-primary/5"
                    >
                      Next
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* CTA */}
              <Button
                size="sm"
                variant={isCompleted ? "ghost" : "default"}
                className={cn(
                  "shrink-0 h-8 text-xs gap-1",
                  isCompleted && "text-green-600 hover:text-green-700 hover:bg-green-50"
                )}
                onClick={() => handleStepClick(step)}
                disabled={isCompleted}
              >
                {isCompleted ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Done
                  </>
                ) : (
                  <>
                    {step.ctaLabel}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
