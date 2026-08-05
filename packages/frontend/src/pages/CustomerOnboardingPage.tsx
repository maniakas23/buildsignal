import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOnboardingProgress } from "@/hooks/useOnboardingProgress";

export function CustomerOnboardingPage() {
  const navigate = useNavigate();
  const { progress, completedCount, totalCount, currentStep, completeStep } = useOnboardingProgress();

  const steps = [
    { id: "profile", label: "Complete your profile", description: "Add your name and company details" },
    { id: "watchlist", label: "Add counties to watchlist", description: "Select counties you want to monitor" },
    { id: "alert", label: "Set up alert preferences", description: "Configure when you want to be notified" },
    { id: "report", label: "Generate your first report", description: "Create a custom intelligence report" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome to BuildSignal</h1>
          <p className="text-muted-foreground">Complete these steps to get started</p>
        </div>
        <Button onClick={() => navigate("/dashboard")} className="gap-2">Go to Dashboard <ArrowRight className="h-4 w-4"/></Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Onboarding Progress</span>
            <span className="text-sm text-muted-foreground">{completedCount}/{totalCount} completed</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="text-sm text-muted-foreground mt-2">{progress}% complete</div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {steps.map((step) => {
          const isComplete = completedCount >= steps.findIndex((s) => s.id === step.id) + 1;
          const isCurrent = currentStep === step.id;
          return (
            <Card key={step.id} className={isCurrent ? "border-primary" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {isComplete ? <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5"/> : <Circle className={`h-5 w-5 mt-0.5 ${isCurrent ? "text-primary" : "text-muted-foreground"}`}/>}
                  <div className="flex-1">
                    <div className="flex items-center justify-between"><div className="font-medium">{step.label}</div>{isComplete && <Badge variant="default">Done</Badge>}</div>
                    <div className="text-sm text-muted-foreground">{step.description}</div>
                    {!isComplete && (
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => completeStep(step.id)}>
                        {isCurrent ? "Start" : "Complete"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
