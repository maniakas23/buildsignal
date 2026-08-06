import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Users, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function OrganizationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.organization || "");
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/account")} className="gap-2"><ArrowLeft className="h-4 w-4"/>Account</Button>
        <h1 className="text-2xl font-bold">Organization</h1>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5"/>Organization Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label htmlFor="org-name">Organization Name</Label><Input id="org-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your organization name" /></div>
          <div className="space-y-2"><Label>Plan</Label><Badge variant="default">{user?.plan || "Scout"}</Badge></div>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/>Team Members</CardTitle></CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Team management is available on Professional, Business, and Enterprise plans. Upgrade to add team members.</div>
          <Button className="mt-4" variant="outline" onClick={() => navigate("/pricing")}>Upgrade Plan</Button>
        </CardContent>
      </Card>
    </div>
  );
}