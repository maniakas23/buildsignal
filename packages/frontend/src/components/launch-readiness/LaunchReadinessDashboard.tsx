import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function LaunchReadinessDashboard() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Launch Readiness Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Product Readiness</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={0} />
            <p className="text-xs text-gray-400 mt-1">Pre-launch phase</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market Readiness</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={0} />
            <p className="text-xs text-gray-400 mt-1">Not yet measured</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operations Readiness</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={0} />
            <p className="text-xs text-gray-400 mt-1">In progress</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Not yet populated</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PMF Criteria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Customer Feedback</span>
              <span className="text-sm text-yellow-500">Pending</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Retention Rate</span>
              <span className="text-sm text-yellow-500">Pending</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">NPS Score</span>
              <span className="text-sm text-yellow-500">Pending</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Market Fit</span>
              <span className="text-sm text-yellow-500">Pending</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default LaunchReadinessDashboard;
