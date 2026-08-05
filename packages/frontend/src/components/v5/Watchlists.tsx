import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, MapPin, Star } from "lucide-react";

export function Watchlists() {
  const [newName, setNewName] = useState("");
  const utils = trpc.useContext();
  const { data: watchlists, isLoading } = trpc.watchlist.list.useQuery();
  const createWatchlist = trpc.watchlist.create.useMutation({ onSuccess: () => { utils.watchlist.list.invalidate(); setNewName(""); } });
  const deleteWatchlist = trpc.watchlist.delete.useMutation({ onSuccess: () => utils.watchlist.list.invalidate() });
  const removeCounty = trpc.watchlist.removeCounty.useMutation({ onSuccess: () => utils.watchlist.list.invalidate() });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Star className="h-5 w-5"/>Watchlists</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="New watchlist name..." value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && newName.trim() && createWatchlist.mutate({ name: newName })}/>
            <Button onClick={() => newName.trim() && createWatchlist.mutate({ name: newName })} disabled={!newName.trim() || createWatchlist.isLoading}><Plus className="h-4 w-4 mr-2"/>Add</Button>
          </div>
          {isLoading ? (
            <div className="space-y-2">{Array.from({length:3}).map((_,i) => <Skeleton key={i} className="h-20 w-full"/>)}</div>
          ) : watchlists?.length === 0 ? (
            <p className="text-sm text-muted-foreground">No watchlists yet. Create one to track counties.</p>
          ) : (
            <div className="space-y-4">
              {watchlists?.map((watchlist) => (
                <Card key={watchlist.id}>
                  <CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-base">{watchlist.name}</CardTitle><Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => deleteWatchlist.mutate({ id: watchlist.id })}><Trash2 className="h-4 w-4"/></Button></div></CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {watchlist.counties.length === 0 ? <p className="text-sm text-muted-foreground">No counties added</p> : watchlist.counties.map((county) => (
                        <Badge key={county} variant="secondary" className="gap-1"><MapPin className="h-3 w-3"/>{county}
                          <button onClick={() => removeCounty.mutate({ watchlistId: watchlist.id, county })} className="ml-1 hover:text-red-500"><Trash2 className="h-3 w-3"/></button>
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
