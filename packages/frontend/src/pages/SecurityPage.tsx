import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Lock, KeyRound, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const features = [
  { title: "Kimi OAuth", description: "Secure authentication via Kimi", status: "Active", icon: KeyRound },
  { title: "Enterprise SSO", description: "SAML 2.0 single sign-on", status: "Active", icon: Shield },
  { title: "Data Encryption", description: "AES-256 at rest, TLS 1.3 in transit", status: "Active", icon: Lock },
  { title: "Rate Limiting", description: "Request throttling per user/tier", status: "Active", icon: Shield },
  { title: "Security Headers", description: "CSP, HSTS, X-Frame-Options", status: "Active", icon: Lock },
  { title: "Audit Logging", description: "All user actions tracked", status: "Active", icon: Shield },
];

export function SecurityPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Security</h1><p className="text-muted-foreground">Security features and compliance</p></div>
        <Button onClick={() => navigate("/account")} className="gap-2">Account <ArrowRight className="h-4 w-4"/></Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><feature.icon className="h-5 w-5 text-primary"/>{feature.title}</CardTitle>
                <Badge variant="default">{feature.status}</Badge>
              </div>
            </CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{feature.description}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
