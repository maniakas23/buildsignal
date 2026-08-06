import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function Watchlists() {
  const [watchlists, setWatchlists] = useState<any[]>([]);
  const [name, setName] = useState("");

  const createWatchlist = () => {
    if (!name.trim()) {
      toast.error("Enter a name");
      return;
    }
    toast.success("Watchlist created");
    setName("");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Watchlists</h2>

      <div className="flex gap-2">
        <Input
          placeholder="Watchlist name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1"
        />
        <Button onClick={createWatchlist}>Create</Button>
      </div>

      {watchlists.length === 0 && (
        <p className="text-sm text-gray-500">No watchlists yet</p>
      )}
    </div>
  );
}

export default Watchlists;
