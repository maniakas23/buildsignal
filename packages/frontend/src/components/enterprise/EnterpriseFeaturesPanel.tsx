import { useState } from "react";
import { Building2, Users, Shield, Globe, BarChart3, Zap, Lock, Layers } from "lucide-react";

export function EnterpriseFeaturesPanel() {
  const [features] = useState([
    { id: "sso", name: "Single Sign-On (SSO)", description: "SAML 2.0 and OIDC integration for enterprise identity providers", icon: Lock, enabled: true },
    { id: "api", name: "API Access", description: "Full REST API with rate limits tailored to your plan", icon: Zap, enabled: true },
    { id: "teams", name: "Team Management", description: "Create teams, assign roles, and manage permissions", icon: Users, enabled: true },
    { id: "custom", name: "Custom Reports", description: "Build and schedule custom executive reports", icon: BarChart3, enabled: false },
    { id: "multi", name: "Multi-Region", description: "Deploy across multiple geographic regions", icon: Globe, enabled: false },
    { id: "audit", name: "Audit Logs", description: "Comprehensive audit trail for compliance", icon: Layers, enabled: true },
  ]);

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-6">
        <Building2 className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Enterprise Features</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature) => (
          <div key={feature.id} className={`p-4 rounded-lg border ${feature.enabled ? "border-primary/20 bg-primary/5" : "border-muted bg-muted/50"}`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${feature.enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                <feature.icon className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{feature.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    feature.enabled ? "bg-green-50 text-green-700" : "bg-muted text-muted-foreground"
                  }`}>
                    {feature.enabled ? "Enabled" : "Coming Soon"}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">{feature.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
