import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { Search, MapPin, TrendingUp, Filter } from "lucide-react";
import { WorkspaceOverview } from "./WorkspaceOverview";
import { WorkspaceMap } from "./WorkspaceMap";
import { WorkspaceTimeline } from "./WorkspaceTimeline";
import { WorkspaceHistorical } from "./WorkspaceHistorical";
import { WorkspaceEvidence } from "./WorkspaceEvidence";

export function IntelligenceWorkspace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const { data: searchResults, isLoading } = trpc.search.global.useQuery({ query: searchQuery.trim() }, { enabled: searchQuery.trim().length >= 2 });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
          <Input placeholder="Search counties, opportunities, or permits..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9"/>
        </div>
        <Button variant="outline" size="icon"><Filter className="h-4 w-4"/></Button>
      </div>
      {searchQuery.trim().length >= 2 && (
        <Card>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="space-y-2">{Array.from({length:2}).map((_,i) => <Skeleton key={i} className="h-10 w-full"/>)}</div>
            ) : searchResults && ((searchResults.opportunities?.length || 0) + (searchResults.counties?.length || 0) + (searchResults.alerts?.length || 0) > 0) ? (
              <div className="space-y-4">
                {searchResults.counties && searchResults.counties.length > 0 && (
                  <div><h4 className="text-sm font-medium mb-2">Counties</h4><div className="flex flex-wrap gap-2">{searchResults.counties.map((county) => <Badge key={county.id} variant="secondary" className="gap-1"><MapPin className="h-3 w-3"/>{county.name}, {county.state}</Badge>)}</div></div>
                )}
                {searchResults.opportunities && searchResults.opportunities.length > 0 && (
                  <div><h4 className="text-sm font-medium mb-2">Opportunities</h4><div className="space-y-1">{searchResults.opportunities.map((opp) => <div key={opp.id} className="flex items-center gap-2 text-sm p-2 rounded-md hover:bg-accent"><TrendingUp className="h-4 w-4 text-primary"/><span className="font-medium">{opp.title}</span><span className="text-muted-foreground">{opp.county}, {opp.state}</span></div>)}</div></div>
                )}
              </div>
            ) : <p className="text-sm text-muted-foreground">No results found</p>}
          </CardContent>
        </Card>
      )}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5"><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="map">Map</TabsTrigger><TabsTrigger value="timeline">Timeline</TabsTrigger><TabsTrigger value="historical">Historical</TabsTrigger><TabsTrigger value="evidence">Evidence</TabsTrigger></TabsList>
        <TabsContent value="overview" className="mt-4"><WorkspaceOverview/></TabsContent>
        <TabsContent value="map" className="mt-4"><WorkspaceMap/></TabsContent>
        <TabsContent value="timeline" className="mt-4"><WorkspaceTimeline/></TabsContent>
        <TabsContent value="historical" className="mt-4"><WorkspaceHistorical/></TabsContent>
        <TabsContent value="evidence" className="mt-4"><WorkspaceEvidence/></TabsContent>
      </Tabs>
    </div>
  );
}
