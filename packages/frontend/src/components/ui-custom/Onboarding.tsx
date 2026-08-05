import { useState } from "react";
import { X, ChevronRight, Building2, Map, Bell, Settings, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface OnboardingProps {
  onComplete?: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const steps = [
    {
      title: "Welcome to BuildSignal",
      description: "Your commercial intelligence platform for government building permits. Let's get you set up in 2 minutes.",
      icon: Building2,
      action: null,
    },
    {
      title: "Explore the Opportunity Map",
      description: "Navigate to the Opportunity Map to visualize county-level building permits across the country.",
      icon: Map,
      action: { label: "Go to Map", path: "/opportunities" },
    },
    {
      title: "Set Up Alerts",
      description: "Configure county alerts to get notified when significant market changes occur.",
      icon: Bell,
      action: { label: "Configure Alerts", path: "/alerts" },
    },
    {
      title: "You're All Set",
      description: "You've completed the essential setup. You can always revisit these steps from Settings.",
      icon: CheckCircle,
      action: null,
    },
  ];

  const current = steps[step];
  const Icon = current.icon;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setIsVisible(false);
      onComplete?.();
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    onComplete?.();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-8 rounded-full ${i === step ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
          <button onClick={handleSkip} aria-label="Skip onboarding">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{current.title}</h3>
          <p className="text-sm text-muted-foreground">{current.description}</p>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Skip
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {step === steps.length - 1 ? "Get Started" : "Next"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
