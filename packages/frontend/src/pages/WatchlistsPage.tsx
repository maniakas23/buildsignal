import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Watchlist { id: string; name: string; counties: string[]; alerts: boolean; }

export function WatchlistsPage() {
  const navigate = useNavigate();
  const [watchlists, setWatchlists] = useState<Watchlist[]>([
    { id: "1", name: "Phoenix Metro", counties: ["Maricopa, AZ"], alerts: true },
    { id: "2", name: "Texas Triangle", counties: ["Harris, TX", "Travis, TX", "Dallas, TX"], alerts: true },
    { id: "3", name: "Florida Coast", counties: ["Miami-Dade, FL", "Broward, FL"], alerts: false },
  ]);
  const [newName, setNewName] = useState("");

  const addWatchlist = () => {
    if (!newName.trim()) return;
    setWatchlists((prev) => [...prev, { id: Date.now().toString(), name: newName, counties: [], alerts: true }]);
    setNewName("");
  };

  const deleteWatchlist = (id: string) => {
    setWatchlists((prev) => prev.filter((w) => w.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Watchlists</h1><p className="text-muted-foreground">Monitor counties and opportunities</p></div>
        <Button onClick={() => navigate("/opportunities")} className="gap-2">Opportunities <ArrowRight className="h-4 w-4"/></Button>
      </div>

      <div className="flex gap-2">
        <Input placeholder="New watchlist name..." value={newName} onChange={(e) => setNewName(e.target.value)} />
        <Button onClick={addWatchlist} className="gap-2"><Plus className="h-4 w-4"/>Add</Button>
      </div>

      <div className="space-y-2">
        {watchlists.map((watchlist) => (
          <Card key={watchlist.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{watchlist.name}</div>
                  <div className="text-sm text-muted-foreground">{watchlist.counties.length} counties · Alerts {watchlist.alerts ? "on" : "off"}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={watchlist.alerts ? "default" : "outline"}>Alerts {watchlist.alerts ? "On" : "Off"}</Badge>
                  <Button variant="ghost" size="icon" onClick={() => deleteWatchlist(watchlist.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {watchlists.length === 0 && <div className="text-center py-12 text-muted-foreground">No watchlists yet</div>}
      </div>
    </div>
  );
}
