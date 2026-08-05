import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const checks = [
  { category: "Infrastructure", items: [
    { label: "API uptime SLA", target: "99.9%", current: "99.95%", pass: true },
    { label: "Database backup RPO", target: "<1h", current: "30m", pass: true },
    { label: "CDN edge coverage", target: "Global", current: "250+ PoPs", pass: true },
  ]},
  { category: "Performance", items: [
    { label: "P95 API latency", target: "<200ms", current: "142ms", pass: true },
    { label: "Page load time", target: "<3s", current: "2.1s", pass: true },
    { label: "Bundle size", target: "<500KB", current: "487KB", pass: true },
  ]},
  { category: "Security", items: [
    { label: "OWASP Top 10", target: "Pass", current: "Pass", pass: true },
    { label: "Penetration test", target: "Pass", current: "Pass", pass: true },
    { label: "SOC 2 readiness", target: "In Progress", current: "Stage 2", pass: false },
  ]},
];

export function ProductionExcellencePage() {
  const navigate = useNavigate();
  const totalItems = checks.flatMap((c) => c.items).length;
  const passed = checks.flatMap((c) => c.items).filter((i) => i.pass).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Production Excellence</h1><p className="text-muted-foreground">Production readiness and quality benchmarks</p></div>
        <Button onClick={() => navigate("/launch-readiness")} className="gap-2">Launch Readiness <ArrowRight className="h-4 w-4"/></Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div><div className="text-3xl font-bold">{passed}/{totalItems}</div><div className="text-sm text-muted-foreground">Checks passed</div></div>
            <Badge variant={passed === totalItems ? "default" : "secondary"}>{passed === totalItems ? "EXCELLENT" : "NEEDS WORK"}</Badge>
          </div>
          <Progress value={(passed / totalItems) * 100} className="h-2" />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {checks.map((category) => (
          <Card key={category.category}>
            <CardHeader><CardTitle>{category.category}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {category.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {item.pass ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                      <div><div className="font-medium text-sm">{item.label}</div><div className="text-xs text-muted-foreground">Target: {item.target}</div></div>
                    </div>
                    <Badge variant={item.pass ? "default" : "secondary"}>{item.current}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
