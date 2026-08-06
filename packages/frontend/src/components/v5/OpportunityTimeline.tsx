import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function OpportunityTimeline() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Timeline</h2>

      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No activity yet</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default OpportunityTimeline;
