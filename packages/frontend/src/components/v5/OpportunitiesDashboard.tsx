import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function OpportunitiesDashboard() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Opportunities</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>New This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>High Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No opportunities yet</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default OpportunitiesDashboard;
