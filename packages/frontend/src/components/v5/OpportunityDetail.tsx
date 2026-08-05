import { useParams } from "react-router-dom";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, TrendingUp, Calendar, Building2 } from "lucide-react";
import { Link } from "react-router-dom";

export function OpportunityDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = trpc.opportunity.getById.useQuery({ id: id! });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Opportunity not found</p>
        <Button asChild className="mt-4">
          <Link to="/opportunities">Back to Opportunities</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild>
        <Link to="/opportunities" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl font-bold">{data.title}</h1>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant={data.confidence > 80 ? "default" : "secondary"}>{data.confidence}% confidence</Badge>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {data.county}, {data.state}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Permit Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.volume}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              <TrendingUp className="h-5 w-5 text-green-500" />
              {data.growthRate > 0 ? "+" : ""}{data.growthRate}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Timeframe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              <Calendar className="h-5 w-5" />
              {data.timeframe}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{data.description}</p>
        </CardContent>
      </Card>

      {data.relatedPermits && data.relatedPermits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Related Permits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.relatedPermits.map((permit) => (
                <div key={permit.id} className="flex items-center gap-2 p-2 rounded-lg border">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{permit.type}</div>
                    <div className="text-sm text-muted-foreground">{permit.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
