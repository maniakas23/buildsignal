import { useState } from "react";
import { Download, FileText, FileSpreadsheet, X, Calendar, Filter } from "lucide-react";
import { trpc } from "@/providers/trpc";

export function ReportExport() {
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<"pdf" | "csv" | "xlsx">("pdf");
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "custom">("30d");
  const [isExporting, setIsExporting] = useState(false);

  const recommendations = trpc.recommendation.list.useQuery({ limit: 1000 });
  const alerts = trpc.alert.list.useQuery({});

  const handleExport = async () => {
    setIsExporting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsExporting(false);
    setIsOpen(false);
  };

  const formatIcon = {
    pdf: FileText,
    csv: FileSpreadsheet,
    xlsx: FileSpreadsheet,
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm hover:bg-accent"
      >
        <Download className="h-4 w-4" />
        Export Report
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-card border rounded-lg shadow-lg z-50 p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium">Export Report</span>
            <button onClick={() => setIsOpen(false)} aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Format</label>
              <div className="flex gap-2">
                {(["pdf", "csv", "xlsx"] as const).map((f) => {
                  const Icon = formatIcon[f];
                  return (
                    <button
                      key={f}
                      onClick={() => setFormat(f)}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                        format === f ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {f.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <div className="flex gap-2">
                {(["7d", "30d", "90d"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDateRange(d)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
                      dateRange === d ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent"
                    }`}
                  >
                    {d === "7d" ? "7 days" : d === "30d" ? "30 days" : "90 days"}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Includes {recommendations.data?.length || 0} recommendations and {alerts.data?.length || 0} alerts
            </div>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isExporting ? (
                "Exporting..."
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export {format.toUpperCase()}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
