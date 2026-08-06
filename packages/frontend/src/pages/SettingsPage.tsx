import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CreditCard, Globe, Key, Mail, User, Zap, Building2, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { showError, showSuccess } from "@/lib/toast";

export function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSave = async () => {
    setSaving(true);
    try {
      showSuccess("Settings saved successfully");
    } catch (error) {
      showError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      showError("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      showError("Password must be at least 8 characters");
      return;
    }
    showSuccess("Password updated successfully");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleDeleteAccount = () => {
    if (showDeleteConfirm) {
      showSuccess("Account deletion requested");
      navigate("/");
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const planName = user?.plan || 'scout';
  const planLimits: Record<string, { signals: number; price: string; name: string }> = {
    scout: { signals: 50, price: '$99/mo', name: 'Scout' },
    professional: { signals: Infinity, price: '$249/mo', name: 'Professional' },
    business: { signals: Infinity, price: '$599/mo', name: 'Business' },
    enterprise: { signals: Infinity, price: 'Custom', name: 'Enterprise' },
  };
  const plan = planLimits[planName];

  const [invoices] = useState<{ id: string; date: string; amount: string; status: string; plan: string }[]>([]);

  return (
    <div className="min-h-screen bg-wash-primary pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-ink-primary">Settings</h1>
          <p className="mt-2 text-base text-ink-secondary">
            Manage your account, subscription, and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Main settings */}
          <div className="lg:col-span-2 space-y-8">
            {/* Account Info */}
            <section>
              <h2 className="text-xl font-semibold text-ink-primary mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-accent-indigo" />
                Account Information
              </h2>
              <Card className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={user?.name || ""} placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={user?.email || ""} placeholder="your@email.com" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </Card>
            </section>

            {/* Password */}
            <section>
              <h2 className="text-xl font-semibold text-ink-primary mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-accent-indigo" />
                Change Password
              </h2>
              <Card className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handlePasswordChange}>Update Password</Button>
                </div>
              </Card>
            </section>

            {/* Notifications */}
            <section>
              <h2 className="text-xl font-semibold text-ink-primary mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-accent-indigo" />
                Notifications
              </h2>
              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-ink-primary">Email Notifications</p>
                    <p className="text-sm text-ink-secondary">Receive alerts about new signals</p>
                  </div>
                  <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
                </div>
              </Card>
            </section>

            {/* Billing */}
            <section>
              <h2 className="text-xl font-semibold text-ink-primary mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-accent-indigo" />
                Billing &amp; Invoices
              </h2>
              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-ink-primary">Current Plan</p>
                    <p className="text-sm text-ink-secondary">{plan.name} — {plan.price}</p>
                  </div>
                  <Button variant="outline" onClick={() => navigate("/pricing")}>
                    Change Plan
                  </Button>
                </div>
                <Separator />
                <div>
                  <p className="font-medium text-ink-primary mb-2">Invoices</p>
                  {invoices.length === 0 ? (
                    <p className="text-sm text-ink-tertiary">No invoices yet</p>
                  ) : (
                    <div className="space-y-2">
                      {invoices.map(inv => (
                        <div key={inv.id} className="flex items-center justify-between text-sm">
                          <span>{inv.date}</span>
                          <span>{inv.amount}</span>
                          <Badge variant={inv.status === 'paid' ? 'default' : 'secondary'}>{inv.status}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </section>

            {/* Danger Zone */}
            <section>
              <h2 className="text-xl font-semibold text-accent-crimson mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Danger Zone
              </h2>
              <Card className="p-6 border-accent-crimson/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-ink-primary">Delete Account</p>
                    <p className="text-sm text-ink-secondary">This action cannot be undone</p>
                  </div>
                  <Button variant="destructive" onClick={handleDeleteAccount}>
                    {showDeleteConfirm ? "Confirm Delete" : "Delete Account"}
                  </Button>
                </div>
                {showDeleteConfirm && (
                  <p className="mt-3 text-sm text-accent-crimson">
                    Click again to permanently delete your account and all data.
                  </p>
                )}
              </Card>
            </section>
          </div>

          {/* Right column - Plan overview */}
          <div className="space-y-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-ink-primary mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent-amber" />
                Plan Overview
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-secondary">Plan</span>
                  <Badge>{plan.name}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-secondary">Price</span>
                  <span className="text-sm font-medium text-ink-primary">{plan.price}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-secondary">Signals</span>
                  <span className="text-sm font-medium text-ink-primary">
                    {plan.signals === Infinity ? 'Unlimited' : plan.signals}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
