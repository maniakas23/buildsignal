import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, CheckCircle2, BookOpen } from "lucide-react";

const docs = [
  { title: "API Reference", description: "Complete REST API documentation", status: "Complete", icon: FileText },
  { title: "Authentication Guide", description: "Kimi OAuth and Enterprise SSO setup", status: "Complete", icon: BookOpen },
  { title: "Integration Guide", description: "Webhooks, SDKs, and third-party tools", status: "Complete", icon: ExternalLink },
  { title: "Data Dictionary", description: "Schema definitions and field references", status: "Complete", icon: FileText },
  { title: "Changelog", description: "Version history and release notes", status: "Complete", icon: CheckCircle2 },
];

export function LaunchDocsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Launch Documentation</h1>
      <p className="text-muted-foreground">Documentation status and resources for v5.4.7</p>

      <div className="space-y-2">
        {docs.map((doc) => (
          <Card key={doc.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <doc.icon className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">{doc.title}</div>
                    <div className="text-sm text-muted-foreground">{doc.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="gap-1"><CheckCircle2 className="h-3 w-3"/>{doc.status}</Badge>
                  <Button variant="ghost" size="sm">View</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
