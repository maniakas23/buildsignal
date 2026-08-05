import { useState, useEffect } from "react";
import { Map, Lightbulb, TrendingUp, X, ChevronRight } from "lucide-react";

export function DashboardTour() {
  const [isOpen, setIsOpen] = useState(true);
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to BuildSignal",
      description: "Your commercial intelligence platform for construction market opportunities.",
      icon: Map,
      target: "dashboard",
    },
    {
      title: "Opportunity Map",
      description: "Explore high-signal counties with real-time permit and growth data.",
      icon: Map,
      target: "opportunities",
    },
    {
      title: "AI Recommendations",
      description: "Get personalized recommendations based on your target markets.",
      icon: Lightbulb,
      target: "recommendations",
    },
    {
      title: "Market Trends",
      description: "Track market trends and stay ahead of the competition.",
      icon: TrendingUp,
      target: "trends",
    },
  ];

  if (!isOpen) return null;

  const currentStep = steps[step];
  const CurrentIcon = currentStep.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CurrentIcon className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                Step {step + 1} of {steps.length}
              </span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <h3 className="text-lg font-semibold mb-2">{currentStep.title}</h3>
          <p className="text-sm text-muted-foreground mb-6">{currentStep.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-8 rounded-full ${i === step ? "bg-primary" : "bg-muted"}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="rounded-lg border border-input px-4 py-2 text-sm hover:bg-accent"
                >
                  Back
                </button>
              )}
              {step < steps.length - 1 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Get Started
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
