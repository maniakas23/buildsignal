import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AdminConsolePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Console</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Manage users</p>
            <Button className="mt-2" variant="outline">View Users</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Manage organizations</p>
            <Button className="mt-2" variant="outline">View Organizations</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">System settings</p>
            <Button className="mt-2" variant="outline">System Settings</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Audit logs</p>
            <Button className="mt-2" variant="outline">View Logs</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminConsolePage;
