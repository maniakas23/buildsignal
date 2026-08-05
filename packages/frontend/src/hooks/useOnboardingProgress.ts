import { useOnboarding } from "./useOnboarding";

export function useOnboardingProgress() {
  const onboarding = useOnboarding();
  const completedCount = onboarding.steps.filter((s) => s.completed).length;
  const totalCount = onboarding.steps.length;
  const progress = Math.round((completedCount / totalCount) * 100);

  return {
    progress,
    completedCount,
    totalCount,
    isComplete: onboarding.isComplete,
    currentStep: onboarding.currentStep,
    completeStep: onboarding.completeStep,
    skipOnboarding: onboarding.skipOnboarding,
  };
}
