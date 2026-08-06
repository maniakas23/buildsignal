import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function QualityAssurance() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Quality Assurance</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Security Score</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={0} />
            <p className="text-xs text-gray-400 mt-1">0 / Pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Score</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={0} />
            <p className="text-xs text-gray-400 mt-1">0 / Pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accessibility Score</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={0} />
            <p className="text-xs text-gray-400 mt-1">0 / Pending</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No test results yet</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default QualityAssurance;
