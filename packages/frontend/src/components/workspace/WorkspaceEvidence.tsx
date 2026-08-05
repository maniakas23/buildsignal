import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, Download, CheckCircle2 } from "lucide-react";

export function WorkspaceEvidence() {
  const evidence = [
    { id: "1", title: "Building Permit #2024-001234", type: "permit" as const, source: "Maricopa County", date: "2024-01-15", verified: true },
    { id: "2", title: "Commercial Development Report Q1 2024", type: "report" as const, source: "CBRE", date: "2024-03-01", verified: true },
    { id: "3", title: "Phoenix Metro Area Growth Analysis", type: "news" as const, source: "Arizona Republic", date: "2024-02-20", verified: false },
  ];
  const typeIcon = { permit: <FileText className="h-4 w-4 text-blue-500" />, news: <FileText className="h-4 w-4 text-yellow-500" />, report: <FileText className="h-4 w-4 text-green-500" />, dataset: <FileText className="h-4 w-4 text-purple-500" /> };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Evidence & Sources</h3>
      <div className="space-y-2">
        {evidence.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {typeIcon[item.type]}
                  <div>
                    <div className="font-medium text-sm">{item.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{item.source} · {item.date}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs capitalize">{item.type}</Badge>
                      {item.verified && <Badge variant="secondary" className="text-xs gap-1"><CheckCircle2 className="h-3 w-3"/>Verified</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8"><ExternalLink className="h-4 w-4"/></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4"/></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
