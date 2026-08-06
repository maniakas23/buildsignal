import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ChevronRight } from "lucide-react";

const steps = [
  {
    title: "Create your account",
    description: "Sign up with Kimi OAuth or your email address.",
  },
  {
    title: "Choose your plan",
    description: "Select from Scout, Professional, Business, or Enterprise.",
  },
  {
    title: "Set up your areas",
    description: "Add counties and cities you want to monitor.",
  },
  {
    title: "Configure alerts",
    description: "Set up notifications for new opportunities.",
  },
  {
    title: "Start exploring",
    description: "Browse signals, patterns, and recommendations.",
  },
];

export function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Getting Started</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className={`flex items-start gap-3 ${index <= currentStep ? "opacity-100" : "opacity-50"}`}
            >
              <div className="mt-0.5">
                {index < currentStep ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <div className={`w-5 h-5 rounded-full border-2 ${index === currentStep ? "border-blue-500" : "border-gray-300"}`} />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{step.title}</p>
                <p className="text-sm text-gray-500">{step.description}</p>
              </div>
            </div>
          ))}

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            <Button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              disabled={currentStep === steps.length - 1}
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default Onboarding;
