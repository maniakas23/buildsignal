import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OpportunityExplanationProps {
  opportunityId?: string;
}

export function OpportunityExplanation({ opportunityId }: OpportunityExplanationProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Explanation</h2>

      <Card>
        <CardHeader>
          <CardTitle>Why this opportunity?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Select an opportunity to see the explanation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default OpportunityExplanation;
