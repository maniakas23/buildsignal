import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function DailyBriefPage() {
  const navigate = useNavigate();

  const brief = {
    date: new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
    alerts: 3,
    newOpportunities: 7,
    permitSurge: "Maricopa County",
    topRecommendation: "Harris County commercial zone",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Daily Executive Brief</h1>
          <p className="text-muted-foreground flex items-center gap-1"><Calendar className="h-4 w-4"/>{brief.date}</p>
        </div>
        <Button onClick={() => navigate("/dashboard")} className="gap-2">Dashboard <ArrowRight className="h-4 w-4"/></Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">New Alerts</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{brief.alerts}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">New Opportunities</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{brief.newOpportunities}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Permit Surge</CardTitle></CardHeader><CardContent><div className="text-lg font-bold">{brief.permitSurge}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Top Pick</CardTitle></CardHeader><CardContent><div className="text-lg font-bold">{brief.topRecommendation}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5"/>Brief Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <p>Good morning. Here is your daily intelligence briefing for {brief.date}.</p>
            <p>There are <Badge variant="secondary">{brief.alerts} new alerts</Badge> requiring attention, and <Badge variant="secondary">{brief.newOpportunities} new opportunities</Badge> have been identified by the Kestovar engine.</p>
            <p><strong>Permit Surge:</strong> {brief.permitSurge} shows a significant increase in building permit activity compared to the 30-day average.</p>
            <p><strong>Top Recommendation:</strong> Focus on {brief.topRecommendation} where confidence levels are above 85%.</p>
            <div className="flex items-center gap-1 text-muted-foreground"><Clock className="h-4 w-4"/><span>Generated at {new Date().toLocaleTimeString()}</span></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
