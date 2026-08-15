import { useState, useRef, useCallback } from "react";
import { trackEvent } from "@/hooks/usePageTracking";
import { TrendingUp, MapPin, AlertTriangle, Activity, Info } from "lucide-react";

type TabKey = "permits" | "infrastructure" | "momentum";

const permitData = [
  { month: "Jan", observed: 120 }, { month: "Feb", observed: 135 },
  { month: "Mar", observed: 128 }, { month: "Apr", observed: 156 },
  { month: "May", observed: 172 }, { month: "Jun", observed: 189 },
  { month: "Jul", observed: 201 }, { month: "Aug", observed: 195 },
  { month: "Sep", observed: 210 }, { month: "Oct", observed: 225 },
  { month: "Nov", observed: 218 }, { month: "Dec", observed: 240 },
];

const infrastructureData = [
  { category: "Road", count: 45 }, { category: "Utility", count: 38 },
  { category: "Commercial", count: 62 }, { category: "Residential", count: 89 },
  { category: "Public", count: 27 },
];

const momentumSignals = [
  { county: "Dallas County, TX", signal: "Permit acceleration", confidence: 86, trend: "up" as const, detail: "Commercial permit filings increased month-over-month" },
  { county: "Travis County, TX", signal: "Infrastructure surge", confidence: 78, trend: "up" as const, detail: "Road and utility project approvals trending higher" },
  { county: "Mecklenburg County, NC", signal: "Mixed activity", confidence: 64, trend: "flat" as const, detail: "Residential steady, commercial slightly down" },
];

const tabs: { key: TabKey; label: string }[] = [
  { key: "permits", label: "Permit Activity" },
  { key: "infrastructure", label: "Infrastructure Signals" },
  { key: "momentum", label: "Market Momentum" },
];

function SimpleLineChart({ data }: { data: { month: string; observed: number }[] }) {
  const width = 600, height = 250, padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const maxValue = Math.max(...data.map((d) => d.observed));
  const minValue = Math.min(...data.map((d) => d.observed));
  const valueRange = maxValue - minValue || 1;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((d.observed - minValue) / valueRange) * chartHeight;
    return `${x},${y}`;
  }).join(" ");

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    y: padding + chartHeight - t * chartHeight,
    label: Math.round(minValue + t * valueRange),
  }));

  const xTicks = data.filter((_, i) => i % 2 === 0).map((d, i) => ({
    x: padding + (i * 2 / (data.length - 1)) * chartWidth,
    label: d.month,
  }));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
      {yTicks.map((t, i) => (
        <line key={`g${i}`} x1={padding} y1={t.y} x2={width - padding} y2={t.y} stroke="#1f2937" strokeWidth="1" />
      ))}
      {yTicks.map((t, i) => (
        <text key={`yl${i}`} x={padding - 10} y={t.y + 4} textAnchor="end" fill="#7A8A9A" fontSize="10">{t.label}</text>
      ))}
      {xTicks.map((t, i) => (
        <text key={`xl${i}`} x={t.x} y={height - 10} textAnchor="middle" fill="#7A8A9A" fontSize="10">{t.label}</text>
      ))}
      <polyline points={points} fill="none" stroke="#3ECF8E" strokeWidth="2" />
      {data.map((d, i) => {
        const x = padding + (i / (data.length - 1)) * chartWidth;
        const y = padding + chartHeight - ((d.observed - minValue) / valueRange) * chartHeight;
        return <circle key={`d${i}`} cx={x} cy={y} r="4" fill="#3ECF8E" />;
      })}
    </svg>
  );
}

function SimpleBarChart({ data }: { data: { category: string; count: number }[] }) {
  const width = 600, height = 250, padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const maxValue = Math.max(...data.map((d) => d.count));
  const barWidth = (chartWidth / data.length) * 0.6;
  const barSpacing = (chartWidth / data.length) * 0.4;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const y = padding + chartHeight - t * chartHeight;
        return (
          <g key={`g${i}`}>
            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#1f2937" strokeWidth="1" />
            <text x={padding - 10} y={y + 4} textAnchor="end" fill="#7A8A9A" fontSize="10">{Math.round(t * maxValue)}</text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const barHeight = (d.count / maxValue) * chartHeight;
        const x = padding + i * (chartWidth / data.length) + barSpacing / 2;
        const y = padding + chartHeight - barHeight;
        return (
          <g key={`b${i}`}>
            <rect x={x} y={y} width={barWidth} height={barHeight} fill="#3ECF8E" rx="4" />
            <text x={x + barWidth / 2} y={height - 10} textAnchor="middle" fill="#7A8A9A" fontSize="10">{d.category}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function MarketPulseDemo() {
  const [activeTab, setActiveTab] = useState<TabKey>("permits");
  const tabListRef = useRef<HTMLDivElement>(null);

  const handleTabChange = useCallback((key: TabKey) => {
    setActiveTab(key);
    trackEvent("market_pulse_interacted", { tab: key });
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const currentIndex = tabs.findIndex((t) => t.key === activeTab);
    let nextIndex = currentIndex;
    switch (e.key) {
      case "ArrowLeft": e.preventDefault(); nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1; break;
      case "ArrowRight": e.preventDefault(); nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0; break;
      case "Home": e.preventDefault(); nextIndex = 0; break;
      case "End": e.preventDefault(); nextIndex = tabs.length - 1; break;
      default: return;
    }
    const nextKey = tabs[nextIndex].key;
    setActiveTab(nextKey);
    trackEvent("market_pulse_interacted", { tab: nextKey, method: "keyboard" });
    const tabButtons = tabListRef.current?.querySelectorAll('[role="tab"]');
    if (tabButtons?.[nextIndex]) (tabButtons[nextIndex] as HTMLElement).focus();
  }, [activeTab]);

  return (
    <section id="market-pulse" className="py-20 md:py-28 bg-canvas" aria-labelledby="pulse-heading">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-4">
            <Activity className="w-4 h-4" /><span>Product Preview</span>
          </div>
          <h2 id="pulse-heading" className="text-3xl md:text-4xl font-bold text-ink mb-4">Market Pulse</h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">A representative view of the intelligence BuildSignal delivers. Explore sample data across permit activity, infrastructure signals, and market momentum.</p>
        </div>

        <div className="mb-6 flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-sm">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span><strong>Sample Data:</strong> All figures shown are representative examples for demonstration purposes. Not live market data.</span>
        </div>

        <div className="mb-8">
          <div ref={tabListRef} className="flex flex-wrap gap-2 p-1 bg-surface border border-border rounded-xl" role="tablist" aria-label="Market pulse categories" onKeyDown={handleKeyDown}>
            {tabs.map((tab) => (
              <button key={tab.key} role="tab" aria-selected={activeTab === tab.key} aria-controls={`panel-${tab.key}`} id={`tab-${tab.key}`} tabIndex={activeTab === tab.key ? 0 : -1}
                onClick={() => handleTabChange(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? "bg-emerald-500 text-white" : "text-muted hover:text-ink hover:bg-canvas"}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 md:p-8">
          {activeTab === "permits" && (
            <div role="tabpanel" id="panel-permits" aria-labelledby="tab-permits">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-ink">Permit Volume Trend</h3>
                <span className="text-xs text-muted bg-canvas px-2 py-1 rounded">12-Month Historical</span>
              </div>
              <div className="h-72 md:h-80"><SimpleLineChart data={permitData} /></div>
            </div>
          )}

          {activeTab === "infrastructure" && (
            <div role="tabpanel" id="panel-infrastructure" aria-labelledby="tab-infrastructure">
              <h3 className="text-lg font-semibold text-ink mb-6">Infrastructure Activity by Category</h3>
              <div className="h-72 md:h-80"><SimpleBarChart data={infrastructureData} /></div>
            </div>
          )}

          {activeTab === "momentum" && (
            <div role="tabpanel" id="panel-momentum" aria-labelledby="tab-momentum">
              <h3 className="text-lg font-semibold text-ink mb-6">Detected Growth Signals</h3>
              <div className="space-y-4">
                {momentumSignals.map((signal) => (
                  <div key={signal.county} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-canvas border border-border rounded-xl">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <span className="font-semibold text-ink">{signal.county}</span>
                      </div>
                      <p className="text-sm text-muted">{signal.detail}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-muted">Confidence</p>
                        <p className="text-lg font-bold text-emerald-400 font-mono">{signal.confidence}%</p>
                      </div>
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${signal.trend === "up" ? "bg-emerald-500/10 text-emerald-400" : "bg-gray-500/10 text-gray-400"}`}>
                        {signal.trend === "up" ? <TrendingUp className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                        {signal.signal}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-400 mb-1">Sample Alert: Surge Detected</h4>
                    <p className="text-sm text-muted">Dallas County permit filings show sustained increase over 90-day window. Confidence reflects strength of evidence, not investment certainty.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
