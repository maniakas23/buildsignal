import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/providers/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, CreditCard, BarChart3, Shield, Settings } from "lucide-react";

export function AdminConsolePage() {
  const { data: users, isLoading: usersLoading } = trpc.admin.users.useQuery();
  const { data: stats } = trpc.admin.stats.useQuery();

  if (usersLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Console</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Users</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.totalUsers || 0}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.activeSubscriptions || 0}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">MRR</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">${stats?.mrr || 0}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">API Calls Today</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.apiCallsToday || 0}</div></CardContent></Card>
      </div>

      <Tabs defaultValue="users">
        <TabsList><TabsTrigger value="users">Users</TabsTrigger><TabsTrigger value="billing">Billing</TabsTrigger><TabsTrigger value="security">Security</TabsTrigger><TabsTrigger value="settings">Settings</TabsTrigger></TabsList>
        <TabsContent value="users" className="mt-4">
          <div className="space-y-2">
            {users?.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3"><Users className="h-4 w-4 text-muted-foreground"/><div><div className="font-medium text-sm">{user.name}</div><div className="text-xs text-muted-foreground">{user.email}</div></div></div>
                    <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            )) || <p className="text-muted-foreground">No users found</p>}
          </div>
        </TabsContent>
        <TabsContent value="billing" className="mt-4"><div className="text-muted-foreground">Billing management</div></TabsContent>
        <TabsContent value="security" className="mt-4"><div className="text-muted-foreground">Security settings</div></TabsContent>
        <TabsContent value="settings" className="mt-4"><div className="text-muted-foreground">System settings</div></TabsContent>
      </Tabs>
    </div>
  );
}
