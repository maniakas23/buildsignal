import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ReportBuilder() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Report Builder</h2>

      <Card>
        <CardHeader>
          <CardTitle>Create Report</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Build custom reports from your data.
          </p>
          <Button>Generate Report</Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default ReportBuilder;
