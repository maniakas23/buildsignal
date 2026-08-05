import { useState } from "react";
import { Settings, User, Bell, Shield, CreditCard } from "lucide-react";
import { trpc } from "@/providers/trpc";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const user = trpc.auth.me.useQuery();

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "billing", label: "Billing", icon: CreditCard },
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
                activeTab === tab.id ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="md:col-span-3 p-6 border rounded-lg bg-card">
          {activeTab === "profile" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Profile</h2>
              <div className="space-y-2">
                <label className="text-sm">Name</label>
                <input
                  type="text"
                  value={user.data?.name || ""}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm"
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm">Email</label>
                <input
                  type="email"
                  value={user.data?.email || ""}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm"
                  readOnly
                />
              </div>
            </div>
          )}
          {activeTab === "notifications" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Notifications</h2>
              <p className="text-sm text-muted-foreground">Configure your notification preferences</p>
            </div>
          )}
          {activeTab === "security" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Security</h2>
              <p className="text-sm text-muted-foreground">Manage your security settings</p>
            </div>
          )}
          {activeTab === "billing" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Billing</h2>
              <p className="text-sm text-muted-foreground">Manage your billing and subscription</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
