import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, Building2, TrendingUp, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function SmartSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { data, isLoading } = trpc.search.global.useQuery({ query: query.trim() }, { enabled: query.trim().length >= 2 });

  const handleSelect = (item: { type: string; id: string }) => {
    setIsOpen(false); setQuery("");
    if (item.type === "opportunity") navigate(`/opportunities/${item.id}`);
    else if (item.type === "county") navigate(`/opportunities?county=${item.id}`);
    else if (item.type === "alert") navigate(`/alerts?alert=${item.id}`);
    else if (item.type === "recommendation") navigate(`/recommendations?rec=${item.id}`);
  };

  const hasResults = data && ((data.opportunities?.length || 0) + (data.counties?.length || 0) + (data.alerts?.length || 0) + (data.recommendations?.length || 0) > 0);

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
        <Input placeholder="Search opportunities, counties, alerts..." value={query} onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }} onFocus={() => setIsOpen(true)} className="pl-9 pr-10"/>
        {query && <button onClick={() => { setQuery(""); setIsOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="h-4 w-4 text-muted-foreground"/></button>}
      </div>
      {isOpen && query.trim().length >= 2 && (
        <Card className="absolute top-full mt-1 w-full z-50 max-h-[400px] overflow-y-auto">
          <CardContent className="p-2">
            {isLoading ? (
              <div className="space-y-2 p-2">{Array.from({length:3}).map((_,i) => <Skeleton key={i} className="h-10 w-full"/>)}</div>
            ) : !hasResults ? (
              <div className="p-4 text-center text-sm text-muted-foreground">No results found for "{query}"</div>
            ) : (
              <div className="space-y-1">
                {data?.opportunities && data.opportunities.length > 0 && (
                  <div className="space-y-1"><div className="px-2 py-1 text-xs font-medium text-muted-foreground">Opportunities</div>
                    {data.opportunities.map((item) => (
                      <button key={item.id} onClick={() => handleSelect({type:"opportunity",id:item.id})} className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-accent text-left">
                        <TrendingUp className="h-4 w-4 text-primary"/><div><div className="text-sm font-medium">{item.title}</div><div className="text-xs text-muted-foreground">{item.county}, {item.state}</div></div>
                      </button>
                    ))}
                  </div>
                )}
                {data?.counties && data.counties.length > 0 && (
                  <div className="space-y-1"><div className="px-2 py-1 text-xs font-medium text-muted-foreground">Counties</div>
                    {data.counties.map((item) => (
                      <button key={item.id} onClick={() => handleSelect({type:"county",id:item.id})} className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-accent text-left">
                        <MapPin className="h-4 w-4 text-green-500"/><div><div className="text-sm font-medium">{item.name}</div><div className="text-xs text-muted-foreground">{item.state}</div></div>
                      </button>
                    ))}
                  </div>
                )}
                {data?.alerts && data.alerts.length > 0 && (
                  <div className="space-y-1"><div className="px-2 py-1 text-xs font-medium text-muted-foreground">Alerts</div>
                    {data.alerts.map((item) => (
                      <button key={item.id} onClick={() => handleSelect({type:"alert",id:item.id})} className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-accent text-left">
                        <div className={`h-2 w-2 rounded-full ${item.severity === "critical" ? "bg-red-500" : "bg-yellow-500"}`}/>
                        <div><div className="text-sm font-medium">{item.title}</div><div className="text-xs text-muted-foreground">{item.message}</div></div>
                      </button>
                    ))}
                  </div>
                )}
                {data?.recommendations && data.recommendations.length > 0 && (
                  <div className="space-y-1"><div className="px-2 py-1 text-xs font-medium text-muted-foreground">Recommendations</div>
                    {data.recommendations.map((item) => (
                      <button key={item.id} onClick={() => handleSelect({type:"recommendation",id:item.id})} className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-accent text-left">
                        <Building2 className="h-4 w-4 text-blue-500"/><div><div className="text-sm font-medium">{item.title}</div><div className="text-xs text-muted-foreground">{item.confidence}% confidence</div></div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
