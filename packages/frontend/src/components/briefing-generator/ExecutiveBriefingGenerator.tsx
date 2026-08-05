import { useState } from "react";
import { FileText, Download, Calendar } from "lucide-react";

export function ExecutiveBriefingGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [briefing, setBriefing] = useState<string | null>(null);

  const generateBriefing = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setBriefing(`
# Executive Briefing — ${new Date().toLocaleDateString()}

## Top Opportunities
1. Harris County, TX — Signal Score 8.5
2. Maricopa County, AZ — Signal Score 8.9
3. Travis County, TX — Signal Score 8.7

## Market Trends
- Permit activity up 12% month-over-month
- New construction starts trending positive
- Commercial development accelerating in Southwest markets

## Action Items
- Review Harris County permit pipeline
- Schedule site visit for Maricopa County
- Monitor King County for Q3 opportunities
      `);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Executive Briefing Generator</h3>
        <button
          onClick={generateBriefing}
          disabled={isGenerating}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Calendar className="h-4 w-4" />
          {isGenerating ? "Generating..." : "Generate Briefing"}
        </button>
      </div>
      {briefing && (
        <div className="mt-4 space-y-4">
          <pre className="p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap">{briefing}</pre>
          <button className="flex items-center gap-2 rounded-lg border border-input px-4 py-2 text-sm hover:bg-accent">
            <Download className="h-4 w-4" />
            Download PDF
          </button>
        </div>
      )}
    </div>
  );
}
