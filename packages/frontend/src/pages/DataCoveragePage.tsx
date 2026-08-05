import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Database, MapPin, Building2, FileText } from "lucide-react";

const dataSources = [
  { name: "Building Permits", type: "Primary", coverage: 98, records: 850000, updateFrequency: "Daily" },
  { name: "County Records", type: "Primary", coverage: 95, records: 1200000, updateFrequency: "Daily" },
  { name: "Commercial Projects", type: "Secondary", coverage: 87, records: 45000, updateFrequency: "Weekly" },
  { name: "Infrastructure Plans", type: "Secondary", coverage: 72, records: 12000, updateFrequency: "Weekly" },
  { name: "Zoning Changes", type: "Derived", coverage: 91, records: 8900, updateFrequency: "Real-time" },
];

export function DataCoveragePage() {
  const totalRecords = dataSources.reduce((sum, s) => sum + s.records, 0);
  const avgCoverage = Math.round(dataSources.reduce((sum, s) => sum + s.coverage, 0) / dataSources.length);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Data Coverage</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Data Sources</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{dataSources.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Records</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totalRecords.toLocaleString()}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Avg Coverage</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{avgCoverage}%</div></CardContent></Card>
      </div>

      <div className="space-y-2">
        {dataSources.map((source) => (
          <Card key={source.name}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2"><Database className="h-4 w-4 text-primary"/><span className="font-medium">{source.name}</span></div>
                <Badge variant={source.type === "Primary" ? "default" : "secondary"}>{source.type}</Badge>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Coverage</span><span>{source.coverage}%</span></div>
                <Progress value={source.coverage} className="h-2" />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{source.records.toLocaleString()} records</span>
                  <span>Updated {source.updateFrequency.toLowerCase()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
