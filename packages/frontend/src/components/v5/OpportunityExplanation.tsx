import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb, ChevronDown, ChevronUp, BrainCircuit } from "lucide-react";

interface OpportunityExplanationProps {
  opportunityId: string;
}

export function OpportunityExplanation({ opportunityId }: OpportunityExplanationProps) {
  const [expanded, setExpanded] = useState(false);
  const { data, isLoading } = trpc.opportunity.getExplanation.useQuery({ id: opportunityId });

  if (isLoading) {
    return <Skeleton className="h-32 w-full" />;
  }

  if (!data) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            AI Explanation
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{data.summary}</p>
        {expanded && (
          <div className="mt-4 space-y-3">
            <div>
              <h4 className="font-medium text-sm mb-1">Key Factors</h4>
              <ul className="space-y-1">
                {data.factors.map((factor, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 mt-0.5 text-yellow-500" />
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Data Sources</h4>
              <div className="flex flex-wrap gap-2">
                {data.sources.map((source) => (
                  <span key={source} className="text-xs bg-muted px-2 py-1 rounded-full">
                    {source}
                  </span>
                ))}
              </div>
            </div>
            {data.confidenceExplanation && (
              <div>
                <h4 className="font-medium text-sm mb-1">Confidence Assessment</h4>
                <p className="text-sm text-muted-foreground">{data.confidenceExplanation}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
