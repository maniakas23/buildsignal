import { useState, useEffect } from "react";

interface OnboardingStep {
  id: string;
  label: string;
  completed: boolean;
}

interface OnboardingState {
  steps: OnboardingStep[];
  isComplete: boolean;
  currentStep: string | null;
  isActive: boolean;
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(() => {
    const saved = localStorage.getItem("onboarding_state");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {
      steps: [
        { id: "profile", label: "Complete your profile", completed: false },
        { id: "watchlist", label: "Add counties to watchlist", completed: false },
        { id: "alert", label: "Set up alert preferences", completed: false },
        { id: "report", label: "Generate your first report", completed: false },
      ],
      isComplete: false,
      currentStep: "profile",
      isActive: true,
    };
  });

  useEffect(() => {
    localStorage.setItem("onboarding_state", JSON.stringify(state));
  }, [state]);

  const completeStep = (stepId: string) => {
    setState((prev) => {
      const steps = prev.steps.map((s) => (s.id === stepId ? { ...s, completed: true } : s));
      const isComplete = steps.every((s) => s.completed);
      const currentStep = steps.find((s) => !s.completed)?.id || null;
      return { ...prev, steps, isComplete, currentStep };
    });
  };

  const skipOnboarding = () => {
    setState((prev) => ({ ...prev, isActive: false }));
  };

  const restartOnboarding = () => {
    setState((prev) => ({
      ...prev,
      steps: prev.steps.map((s) => ({ ...s, completed: false })),
      isComplete: false,
      currentStep: "profile",
      isActive: true,
    }));
  };

  return { ...state, completeStep, skipOnboarding, restartOnboarding };
}
