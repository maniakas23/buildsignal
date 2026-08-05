import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rocket, CheckCircle2, ArrowRight, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function EnterpriseLaunchPage() {
  const navigate = useNavigate();

  const features = [
    "SSO Integration (SAML 2.0)",
    "Custom data integrations",
    "Dedicated account manager",
    "SLA guarantees",
    "Advanced analytics API",
    "Multi-tenant architecture",
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <Rocket className="h-16 w-16 text-primary mx-auto" />
        <h1 className="text-3xl font-bold">Enterprise Launch</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">BuildSignal for enterprise teams with custom requirements and dedicated support</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 max-w-3xl mx-auto">
        <Card>
          <CardHeader><CardTitle>Enterprise Features</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500"/><span className="text-sm">{feature}</span></div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Get Started</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Contact our enterprise team for a custom demo and pricing tailored to your organization.</p>
            <Button className="w-full gap-2" onClick={() => navigate("/contact")}><Zap className="h-4 w-4"/>Contact Sales</Button>
            <Button variant="outline" className="w-full gap-2" onClick={() => navigate("/pricing")}>View Pricing <ArrowRight className="h-4 w-4"/></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
