import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, Zap, Shield, Building2, BarChart3, Brain, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center space-y-6 py-12">
        <Badge variant="secondary" className="text-sm">BuildSignal v1.1.0</Badge>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Commercial Intelligence for Construction</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">AI-powered insights from 500+ counties. Predict building trends before they happen.</p>
        <div className="flex items-center justify-center gap-4">
          <Button size="lg" onClick={() => navigate("/login")} className="gap-2">Get Started <ArrowRight className="h-4 w-4"/></Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/pricing")}>View Pricing</Button>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Counties Covered", value: "500+", icon: MapPin },
          { label: "Permits Tracked", value: "2M+", icon: Building2 },
          { label: "AI Accuracy", value: "85%+", icon: Brain },
          { label: "Active Users", value: "10K+", icon: BarChart3 },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6 text-center">
              <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Features */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Key Features</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: "Permit Intelligence", description: "Real-time tracking of building permits across the US", icon: TrendingUp },
            { title: "AI Predictions", description: "Machine learning models predict where construction will surge", icon: Brain },
            { title: "Pattern Detection", description: "Identify market trends before your competitors", icon: Zap },
            { title: "Enterprise Security", description: "SSO, SAML, and audit-ready access controls", icon: Shield },
            { title: "API Access", description: "Integrate BuildSignal into your existing tools", icon: BarChart3 },
            { title: "Custom Reports", description: "Generate executive briefings with one click", icon: Building2 },
          ].map((feature) => (
            <Card key={feature.title}>
              <CardContent className="p-6">
                <feature.icon className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
