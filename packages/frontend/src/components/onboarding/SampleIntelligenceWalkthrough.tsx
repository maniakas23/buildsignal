import { useState } from "react";
import { Compass, MapPin, TrendingUp, Lightbulb, ArrowRight, CheckCircle } from "lucide-react";

export function SampleIntelligenceWalkthrough() {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to BuildSignal",
      description: "Your commercial intelligence platform for finding construction market opportunities.",
      icon: Compass,
    },
    {
      title: "Explore Opportunities",
      description: "Browse high-signal counties with real-time permit data and growth indicators.",
      icon: MapPin,
    },
    {
      title: "Track Trends",
      description: "Monitor market trends and get alerted to significant changes in your target counties.",
      icon: TrendingUp,
    },
    {
      title: "AI Recommendations",
      description: "Get personalized recommendations based on your market interests and goals.",
      icon: Lightbulb,
    },
  ];

  const currentStep = steps[step];
  const CurrentIcon = currentStep.icon;

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="text-center mb-6">
        <CurrentIcon className="mx-auto h-12 w-12 text-primary mb-4" />
        <h3 className="text-lg font-semibold">{currentStep.title}</h3>
        <p className="text-sm text-muted-foreground mt-2">{currentStep.description}</p>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-8 rounded-full ${i === step ? "bg-primary" : "bg-muted"}`}
          />
        ))}
      </div>

      <div className="flex justify-center gap-2">
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
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => setStep(0)}
            className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <CheckCircle className="h-4 w-4" />
            Get Started
          </button>
        )}
      </div>
    </div>
  );
}
