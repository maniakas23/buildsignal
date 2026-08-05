import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download, Plus, Trash2, Eye } from "lucide-react";

export function ReportBuilder() {
  const [title, setTitle] = useState("");
  const [format, setFormat] = useState<"pdf" | "csv" | "xlsx">("pdf");
  const [sections, setSections] = useState({ summary: true, opportunities: true, alerts: false, recommendations: false, analytics: false });

  const utils = trpc.useContext();
  const createReport = trpc.report.create.useMutation({
    onSuccess: () => { utils.report.list.invalidate(); setTitle(""); }
  });
  const { data: reports, isLoading } = trpc.report.list.useQuery();

  const handleCreate = () => {
    if (!title.trim()) return;
    createReport.mutate({
      title, format,
      sections: Object.entries(sections).filter(([,v]) => v).map(([k]) => k),
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5"/>New Report</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><label className="text-sm font-medium">Title</label><Input placeholder="Enter report title..." value={title} onChange={(e) => setTitle(e.target.value)}/></div>
          <div className="space-y-2"><label className="text-sm font-medium">Format</label>
            <Select value={format} onValueChange={(v) => setFormat(v as typeof format)}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent><SelectItem value="pdf">PDF</SelectItem><SelectItem value="csv">CSV</SelectItem><SelectItem value="xlsx">Excel</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><label className="text-sm font-medium">Sections</label>
            <div className="space-y-2">
              {Object.entries(sections).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <Checkbox id={key} checked={value} onCheckedChange={(checked) => setSections((prev) => ({...prev, [key]: checked === true}))}/>
                  <label htmlFor={key} className="text-sm capitalize">{key}</label>
                </div>
              ))}
            </div>
          </div>
          <Button onClick={handleCreate} disabled={!title.trim() || createReport.isLoading} className="w-full"><Plus className="h-4 w-4 mr-2"/>{createReport.isLoading ? "Creating..." : "Create Report"}</Button>
        </CardContent>
      </Card>

      <div>
        <h3 className="font-medium mb-4">Saved Reports</h3>
        {isLoading ? (
          <div className="space-y-2">{Array.from({length:3}).map((_,i) => <Skeleton key={i} className="h-12 w-full"/>)}</div>
        ) : reports?.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reports yet</p>
        ) : (
          <div className="space-y-2">
            {reports?.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3"><FileText className="h-4 w-4 text-muted-foreground"/>
                  <div><div className="font-medium text-sm">{report.title}</div><div className="text-xs text-muted-foreground">{report.format.toUpperCase()} · {report.sections.length} sections</div></div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4"/></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4"/></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500"><Trash2 className="h-4 w-4"/></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
