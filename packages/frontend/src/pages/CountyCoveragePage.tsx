import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin, Building2, CheckCircle2 } from "lucide-react";

const counties = [
  { name: "Maricopa", state: "AZ", status: "live", coverage: 98, permits: 15420 },
  { name: "Harris", state: "TX", status: "live", coverage: 95, permits: 23100 },
  { name: "Miami-Dade", state: "FL", status: "live", coverage: 92, permits: 18700 },
  { name: "Denver", state: "CO", status: "live", coverage: 96, permits: 12300 },
  { name: "Travis", state: "TX", status: "beta", coverage: 78, permits: 8900 },
  { name: "King", state: "WA", status: "beta", coverage: 72, permits: 7600 },
];

export function CountyCoveragePage() {
  const totalCounties = counties.length;
  const liveCounties = counties.filter((c) => c.status === "live").length;
  const totalPermits = counties.reduce((sum, c) => sum + c.permits, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">County Coverage</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Counties</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totalCounties}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Live Counties</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold flex items-center gap-2">{liveCounties}<CheckCircle2 className="h-5 w-5 text-green-500"/></div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Permits Tracked</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totalPermits.toLocaleString()}</div></CardContent></Card>
      </div>

      <div className="space-y-2">
        {counties.map((county) => (
          <Card key={county.name}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary"/><span className="font-medium">{county.name}, {county.state}</span></div>
                <Badge variant={county.status === "live" ? "default" : "secondary"}>{county.status}</Badge>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Coverage</span><span>{county.coverage}%</span></div>
                <Progress value={county.coverage} className="h-2" />
                <div className="text-sm text-muted-foreground">{county.permits.toLocaleString()} permits tracked</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
