import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Building2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockResults = [
  { title: "Phoenix Metro Residential Surge", type: "opportunity", county: "Maricopa, AZ", confidence: 87 },
  { title: "Houston Industrial Expansion", type: "opportunity", county: "Harris, TX", confidence: 82 },
  { title: "Miami Commercial Cooling", type: "alert", county: "Miami-Dade, FL", confidence: 64 },
  { title: "Denver Infrastructure Pipeline", type: "project", county: "Denver, CO", confidence: 74 },
  { title: "Austin Tech Corridor Growth", type: "opportunity", county: "Travis, TX", confidence: 91 },
];

export function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "opportunity" | "alert" | "project">("all");

  const filtered = query.trim() ? mockResults.filter((r) => {
    const matchesQuery = r.title.toLowerCase().includes(query.toLowerCase()) || r.county.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "all" || r.type === filter;
    return matchesQuery && matchesFilter;
  }) : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Search</h1>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search opportunities, counties, projects..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="flex gap-2">
        {(["all", "opportunity", "alert", "project"] as const).map((f) => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}><Filter className="h-3 w-3 mr-1"/>{f.charAt(0).toUpperCase() + f.slice(1)}</Button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length > 0 ? (
          filtered.map((result) => (
            <Card key={result.title} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/opportunities")}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">{result.title}</div>
                      <div className="text-sm text-muted-foreground">{result.county}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={result.type === "opportunity" ? "default" : result.type === "alert" ? "destructive" : "secondary"}>{result.type}</Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : query.trim() ? (
          <div className="text-center py-12 text-muted-foreground">No results for &quot;{query}&quot;</div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">Enter a search query to find opportunities, counties, and projects</div>
        )}
      </div>
    </div>
  );
}
