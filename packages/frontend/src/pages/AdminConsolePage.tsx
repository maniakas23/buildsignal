import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DashboardHeader, DashboardTitle } from "@/components/ui-custom/DashboardHeader";
import { useAuth } from "@/hooks/useAuth";
import { showError } from "@/lib/toast";

export default function AdminConsolePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("users");

  // Only allow admin users
  if (user?.plan !== "enterprise" && user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-wash-primary pt-20 pb-16 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold text-ink-primary">Access Denied</h2>
          <p className="text-ink-secondary mt-2">You need Enterprise access to view this page.</p>
          <Button className="mt-4" onClick={() => window.location.href = "/pricing"}>
            Upgrade to Enterprise
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wash-primary pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DashboardHeader>
          <DashboardTitle
            title="Admin Console"
            subtitle="Manage users, organizations, and platform settings"
          />
        </DashboardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="organizations">Organizations</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card className="p-8 text-center">
              <p className="text-ink-secondary">User management coming soon</p>
            </Card>
          </TabsContent>

          <TabsContent value="organizations" className="space-y-4">
            <Card className="p-8 text-center">
              <p className="text-ink-secondary">Organization management coming soon</p>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card className="p-8 text-center">
              <p className="text-ink-secondary">Platform analytics coming soon</p>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card className="p-8 text-center">
              <p className="text-ink-secondary">Platform settings coming soon</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
