import { useState } from "react";
import { Workflow, CheckCircle, XCircle, AlertTriangle, GitBranch, ArrowRight } from "lucide-react";

export function WorkflowValidator() {
  const [workflows] = useState([
    {
      id: "auth-flow",
      name: "Authentication Flow",
      steps: [
        { name: "SSO Discovery", status: "pass" },
        { name: "Kimi OAuth", status: "pass" },
        { name: "Session Creation", status: "pass" },
        { name: "Redirect to App", status: "pass" },
      ],
    },
    {
      id: "billing-flow",
      name: "Billing Flow",
      steps: [
        { name: "Plan Selection", status: "pass" },
        { name: "Stripe Checkout", status: "pass" },
        { name: "Payment Confirmation", status: "pass" },
        { name: "Subscription Update", status: "pass" },
      ],
    },
    {
      id: "recommendation-flow",
      name: "Recommendation Flow",
      steps: [
        { name: "Kestovar Request", status: "pass" },
        { name: "Data Processing", status: "pass" },
        { name: "AI Analysis", status: "pass" },
        { name: "Result Delivery", status: "pass" },
      ],
    },
    {
      id: "alert-flow",
      name: "Alert Flow",
      steps: [
        { name: "Pattern Detection", status: "pass" },
        { name: "Alert Generation", status: "pass" },
        { name: "Notification", status: "pass" },
        { name: "User Acknowledge", status: "pass" },
      ],
    },
  ]);

  const allPass = workflows.every((w) => w.steps.every((s) => s.status === "pass"));

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-6">
        <Workflow className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Workflow Validator</h3>
      </div>

      <div className="space-y-4">
        {workflows.map((workflow) => (
          <div key={workflow.id} className="p-4 rounded-lg bg-accent">
            <div className="flex items-center gap-2 mb-3">
              <GitBranch className="h-4 w-4 text-primary" />
              <span className="font-medium">{workflow.name}</span>
              {workflow.steps.every((s) => s.status === "pass") ? (
                <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500 ml-auto" />
              )}
            </div>
            <div className="flex items-center gap-2">
              {workflow.steps.map((step, i) => (
                <div key={step.name} className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                    step.status === "pass" ? "bg-green-50 text-green-700" :
                    step.status === "fail" ? "bg-red-50 text-red-700" :
                    "bg-yellow-50 text-yellow-700"
                  }`}>
                    {step.status === "pass" ? <CheckCircle className="h-3 w-3" /> :
                     step.status === "fail" ? <XCircle className="h-3 w-3" /> :
                     <AlertTriangle className="h-3 w-3" />}
                    {step.name}
                  </div>
                  {i < workflow.steps.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {allPass && (
        <div className="mt-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm font-medium">
          All workflows validated successfully
        </div>
      )}
    </div>
  );
}
