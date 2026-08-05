import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mapData = [
  { county: "Maricopa, AZ", lat: 33.45, lng: -112.07, permits: 15420, status: "hot" },
  { county: "Harris, TX", lat: 29.76, lng: -95.37, permits: 23100, status: "hot" },
  { county: "Miami-Dade, FL", lat: 25.76, lng: -80.19, permits: 18700, status: "warm" },
  { county: "Denver, CO", lat: 39.74, lng: -104.99, permits: 12300, status: "warm" },
  { county: "Travis, TX", lat: 30.27, lng: -97.74, permits: 8900, status: "emerging" },
];

export function MapPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">County Map</h1><p className="text-muted-foreground">Geographic view of permit activity</p></div>
        <Button onClick={() => navigate("/opportunities")} className="gap-2">Opportunities <ArrowRight className="h-4 w-4"/></Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="h-[400px] bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Interactive map visualization</p>
              <p className="text-sm text-muted-foreground">{mapData.length} counties displayed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-2 md:grid-cols-3">
        {mapData.map((county) => (
          <Card key={county.county}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary"/><span className="font-medium text-sm">{county.county}</span></div>
                <span className={`text-xs font-medium ${county.status === "hot" ? "text-red-500" : county.status === "warm" ? "text-yellow-500" : "text-blue-500"}`}>{county.status}</span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">{county.permits.toLocaleString()} permits</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
