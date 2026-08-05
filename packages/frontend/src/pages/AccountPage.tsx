import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Mail, Building2, CreditCard, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AccountPage() {
  const navigate = useNavigate();
  const { data: profile, isLoading } = trpc.user.profile.useQuery();
  const { data: subscription } = trpc.stripe.getSubscription.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Account Settings</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5"/>Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input defaultValue={profile?.name || ""} placeholder="Your name"/></div>
            <div className="space-y-2"><Label>Email</Label><Input defaultValue={profile?.email || ""} placeholder="your@email.com" disabled/></div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5"/>Organization</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Company</Label><Input defaultValue={profile?.organization || ""} placeholder="Company name"/></div>
            <div className="space-y-2"><Label>Role</Label><Input defaultValue={profile?.role || ""} placeholder="Your role"/></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5"/>Subscription</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between"><span className="text-sm">Plan</span><Badge variant="secondary">{subscription?.plan || "Free"}</Badge></div>
              <div className="flex items-center justify-between"><span className="text-sm">Status</span><Badge variant={subscription?.status === "active" ? "default" : "secondary"}>{subscription?.status || "Inactive"}</Badge></div>
              <Button variant="outline" className="w-full mt-4 gap-2" onClick={() => navigate("/billing")}>Manage Billing <ArrowRight className="h-4 w-4"/></Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5"/>Notifications</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between"><span>Email alerts</span><Badge variant="outline">Enabled</Badge></div>
              <div className="flex items-center justify-between"><span>Weekly digest</span><Badge variant="outline">Enabled</Badge></div>
              <div className="flex items-center justify-between"><span>Marketing</span><Badge variant="outline">Disabled</Badge></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
