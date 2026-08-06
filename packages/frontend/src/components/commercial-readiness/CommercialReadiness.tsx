import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ReadinessProps {
  className?: string;
}

export function CommercialReadiness({ className }: ReadinessProps) {
  return (
    <div className={className}>
      <h2 className="text-2xl font-bold mb-4">Commercial Readiness</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Customer Evidence</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-2">No customer data yet</p>
            <Progress value={0} />
            <p className="text-xs text-gray-400 mt-1">0 customers committed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product-Market Fit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-2">Pre-launch phase</p>
            <Progress value={0} />
            <p className="text-xs text-gray-400 mt-1">0 NPS responses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Readiness</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-2">Not yet launched</p>
            <Progress value={0} />
            <p className="text-xs text-gray-400 mt-1">$0 MRR</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security & Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-2">In progress</p>
            <Progress value={0} />
            <p className="text-xs text-gray-400 mt-1">0 certifications completed</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Customer References</h3>
        <p className="text-sm text-gray-500">
          No customer references yet. Example companies for demo purposes:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-500 mt-2">
          <li>Example Corp A</li>
          <li>Example Corp B</li>
          <li>Example Corp C</li>
          <li>Example Corp D</li>
        </ul>
      </div>
    </div>
  );
}

export default CommercialReadiness;
