import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Database, Fingerprint } from "lucide-react";

export function DataMoatPage() {
  const moats = [
    { title: "Proprietary Data Pipeline", description: "Direct integrations with 500+ county record offices", icon: Database, level: "High" },
    { title: "AI Model IP", description: "Custom-trained models on 5+ years of permit data", icon: Fingerprint, level: "High" },
    { title: "Knowledge Graph", description: "Relationship mapping between permits, projects, and patterns", icon: Shield, level: "Medium" },
    { title: "Data Network Effects", description: "More users = better predictions through feedback loops", icon: Lock, level: "Medium" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Data Moat</h1>
      <p className="text-muted-foreground">BuildSignal's competitive advantages through proprietary data and AI</p>

      <div className="grid gap-4 md:grid-cols-2">
        {moats.map((moat) => (
          <Card key={moat.title}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><moat.icon className="h-5 w-5 text-primary"/>{moat.title}</CardTitle>
                <Badge variant={moat.level === "High" ? "default" : "secondary"}>{moat.level}</Badge>
              </div>
            </CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{moat.description}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
