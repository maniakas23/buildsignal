import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function BillingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Billing</h1>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium">Free Plan</p>
          <p className="text-sm text-gray-500">Upgrade to access more features</p>
          <Button className="mt-4">Upgrade Plan</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">No payment methods added</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">No billing history</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default BillingPage;
