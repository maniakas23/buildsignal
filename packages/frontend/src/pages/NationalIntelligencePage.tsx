import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Globe, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const regions = [
  { name: "Southwest", states: ["AZ", "TX", "NM", "OK"], counties: 124, permits: 45000, status: "hot" },
  { name: "Southeast", states: ["FL", "GA", "SC", "NC", "AL"], counties: 186, permits: 38000, status: "warm" },
  { name: "Mountain West", states: ["CO", "UT", "NV", "ID"], counties: 98, permits: 22000, status: "warm" },
  { name: "Pacific Northwest", states: ["WA", "OR"], counties: 72, permits: 18000, status: "emerging" },
  { name: "Midwest", states: ["OH", "MI", "IN", "IL"], counties: 210, permits: 28000, status: "stable" },
];

export function NationalIntelligencePage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">National Intelligence Network</h1><p className="text-muted-foreground">Multi-region construction intelligence</p></div>
        <Button onClick={() => navigate("/county-coverage")} className="gap-2">Coverage <ArrowRight className="h-4 w-4"/></Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-6"><div className="text-2xl font-bold">{regions.length}</div><div className="text-sm text-muted-foreground">Regions</div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="text-2xl font-bold">{regions.reduce((s, r) => s + r.counties, 0)}</div><div className="text-sm text-muted-foreground">Counties</div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="text-2xl font-bold">{regions.reduce((s, r) => s + r.permits, 0).toLocaleString()}</div><div className="text-sm text-muted-foreground">Permits Tracked</div></CardContent></Card>
      </div>

      <div className="space-y-2">
        {regions.map((region) => (
          <Card key={region.name}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">{region.name}</div>
                    <div className="text-sm text-muted-foreground">{region.states.join(", ")} · {region.counties} counties</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-muted-foreground">{region.permits.toLocaleString()} permits</div>
                  <Badge variant={region.status === "hot" ? "destructive" : region.status === "warm" ? "default" : "secondary"}>{region.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
