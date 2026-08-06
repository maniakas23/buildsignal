import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OpportunityDetailProps {
  id?: string;
}

export function OpportunityDetail({ id }: OpportunityDetailProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Opportunity Detail</h2>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No opportunity selected</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default OpportunityDetail;
