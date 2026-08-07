import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2,
  Check,
  Mail,
  LayoutDashboard,
  Zap,
  Target,
  Bell,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";

const onboardingSteps = [
  {
    id: 1,
    title: "Your first report is generating...",
    description:
      "We're scanning thousands of data sources to build your personalized intelligence report. This takes about 2 minutes.",
    icon: Zap,
  },
  {
    id: 2,
    title: "Check your email for setup instructions",
    description:
      "We've sent a welcome email with quick-start tips and a link to verify your account.",
    icon: Mail,
  },
  {
    id: 3,
    title: "Explore your dashboard",
    description:
      "Your dashboard is ready. Dive into opportunities, set up alerts, and start tracking markets.",
    icon: LayoutDashboard,
  },
];

const quickTips = [
  {
    title: "Set up your first alert",
    description: "Get notified when new opportunities match your criteria.",
    icon: Bell,
    action: "Go to Alerts",
    path: "/alerts",
  },
  {
    title: "Explore opportunities",
    description: "Browse thousands of verified commercial intelligence signals.",
    icon: Target,
    action: "View Opportunities",
    path: "/opportunities",
  },
  {
    title: "Customize your watchlist",
    description: "Track the counties and markets that matter most to you.",
    icon: Sparkles,
    action: "Manage Watchlist",
    path: "/watchlist",
  },
];

export function WelcomePage() {
  const navigate = useNavigate();
  const [reportProgress, setReportProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Simulate report generation progress
  useEffect(() => {
    const interval = setInterval(() => {
      setReportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setCompletedSteps((s) => (s.includes(1) ? s : [...s, 1]));
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 800);

    // Mark email step as completed after a delay
    const emailTimer = setTimeout(() => {
      setCompletedSteps((s) => (s.includes(2) ? s : [...s, 2]));
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(emailTimer);
    };
  }, []);

  const isStepCompleted = (id: number) => completedSteps.includes(id);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="mx-auto h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to BuildSignal!</h1>
          <p className="text-muted-foreground">
            Your account is ready. Here's what happens next:
          </p>
        </div>

        {/* NEW: Live Customer Onboarding Checklist */}
        <div className="mb-10">
          <OnboardingChecklist
            completedStepIds={[1]}
            onStepClick={(step) => navigate(step.path)}
          />
        </div>

        {/* Onboarding Steps */}
        <div className="space-y-4 mb-12">
          {onboardingSteps.map((step, idx) => {
            const isCompleted = isStepCompleted(step.id);
            const isActive = idx === 0 && !isCompleted;

            return (
              <Card
                key={step.id}
                className={cn(
                  "transition-all",
                  isCompleted && "border-green-200 bg-green-50/30",
                  isActive && "border-primary/30 ring-1 ring-primary/20"
                )}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                        isCompleted
                          ? "bg-green-500 text-white"
                          : isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <step.icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3
                        className={cn(
                          "font-semibold",
                          isCompleted && "text-green-700"
                        )}
                      >
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {step.description}
                      </p>

                      {/* Progress bar for report generation */}
                      {step.id === 1 && !isCompleted && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>Generating report...</span>
                            <span>{Math.min(Math.round(reportProgress), 100)}%</span>
                          </div>
                          <Progress
                            value={Math.min(reportProgress, 100)}
                            className="h-2"
                          />
                        </div>
                      )}

                      {step.id === 1 && isCompleted && (
                        <div className="mt-2 flex items-center gap-1.5 text-sm text-green-600">
                          <Check className="h-4 w-4" />
                          Report ready! Check your dashboard.
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Go to Dashboard CTA */}
        <div className="text-center mb-12">
          <Button
            size="lg"
            onClick={() => navigate("/dashboard")}
            className="gap-2 px-8"
          >
            <LayoutDashboard className="h-5 w-5" />
            Go to Dashboard
            <ArrowRight className="h-5 w-5" />
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            You can return to this page anytime from the Help menu.
          </p>
        </div>

        {/* Quick Tips */}
        <div>
          <h2 className="text-xl font-bold mb-4">Quick Tips to Get Started</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickTips.map((tip) => (
              <Card
                key={tip.title}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(tip.path)}
              >
                <CardContent className="p-4">
                  <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                    <tip.icon className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{tip.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    {tip.description}
                  </p>
                  <span className="text-xs text-primary font-medium flex items-center gap-1">
                    {tip.action}
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            Need help?{" "}
            <button
              onClick={() => navigate("/help")}
              className="text-primary hover:underline"
            >
              Visit our Help Center
            </button>{" "}
            or{" "}
            <button
              onClick={() => navigate("/contact")}
              className="text-primary hover:underline"
            >
              contact support
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
