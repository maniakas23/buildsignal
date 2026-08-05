import { useState, useEffect } from "react";
import { Activity, RefreshCw, TrendingUp, AlertTriangle, Lightbulb, BarChart3, Brain, Zap, Shield, Globe } from "lucide-react";

export function ContinuousIntelligence() {
  const [isRunning, setIsRunning] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [cycles, setCycles] = useState(1_247);

  const [metrics, setMetrics] = useState({
    countiesAnalyzed: 3_142,
    permitsProcessed: 2_456_789,
    signalsDetected: 847,
    alertsGenerated: 23,
  });

  const [pipelineStatus, setPipelineStatus] = useState([
    { name: "Data Ingestion", status: "running", throughput: "12.4K/min", latency: "45ms" },
    { name: "Pattern Analysis", status: "running", throughput: "8.9K/min", latency: "120ms" },
    { name: "Signal Detection", status: "running", throughput: "4.2K/min", latency: "200ms" },
    { name: "Alert Generation", status: "running", throughput: "156/min", latency: "350ms" },
    { name: "Knowledge Update", status: "running", throughput: "89/min", latency: "500ms" },
  ]);

  const [recentFindings, setRecentFindings] = useState([
    { id: 1, county: "Harris County, TX", type: "opportunity", confidence: 92, message: "Permit volume up 25% QoQ", time: "2 min ago" },
    { id: 2, county: "Maricopa County, AZ", type: "trend", confidence: 88, message: "Population growth accelerating", time: "5 min ago" },
    { id: 3, county: "King County, WA", type: "alert", confidence: 78, message: "Approval delays detected", time: "8 min ago" },
    { id: 4, county: "Travis County, TX", type: "opportunity", confidence: 85, message: "Commercial development surge", time: "12 min ago" },
  ]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      setCycles((c) => c + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running": return <Activity className="h-4 w-4 text-green-500 animate-pulse" />;
      case "paused": return <RefreshCw className="h-4 w-4 text-yellow-500" />;
      case "error": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getFindingIcon = (type: string) => {
    switch (type) {
      case "opportunity": return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "trend": return <BarChart3 className="h-4 w-4 text-blue-500" />;
      case "alert": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Lightbulb className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Continuous Intelligence</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            Last update: {lastUpdate.toLocaleTimeString()}
          </span>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-medium ${
              isRunning
                ? "bg-green-50 text-green-700"
                : "bg-yellow-50 text-yellow-700"
            }`}
          >
            {isRunning ? <Zap className="h-3 w-3" /> : <RefreshCw className="h-3 w-3" />}
            {isRunning ? "Running" : "Paused"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-accent">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Counties</span>
          </div>
          <div className="text-2xl font-bold">{metrics.countiesAnalyzed.toLocaleString()}</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Permits</span>
          </div>
          <div className="text-2xl font-bold">{metrics.permitsProcessed.toLocaleString()}</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Signals</span>
          </div>
          <div className="text-2xl font-bold">{metrics.signalsDetected.toLocaleString()}</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Alerts</span>
          </div>
          <div className="text-2xl font-bold">{metrics.alertsGenerated}</div>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-medium mb-3">Pipeline Status</h4>
        <div className="space-y-2">
          {pipelineStatus.map((stage) => (
            <div key={stage.name} className="flex items-center justify-between p-3 rounded-lg bg-accent">
              <div className="flex items-center gap-3">
                {getStatusIcon(stage.status)}
                <span className="text-sm font-medium">{stage.name}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{stage.throughput}</span>
                <span>{stage.latency}</span>
                <span className={`px-2 py-1 rounded-full ${
                  stage.status === "running" ? "bg-green-50 text-green-700" :
                  stage.status === "paused" ? "bg-yellow-50 text-yellow-700" :
                  "bg-red-50 text-red-700"
                }`}>
                  {stage.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-3">Recent Findings</h4>
        <div className="space-y-2">
          {recentFindings.map((finding) => (
            <div key={finding.id} className="flex items-center gap-3 p-3 rounded-lg bg-accent">
              {getFindingIcon(finding.type)}
              <div className="flex-1">
                <div className="text-sm font-medium">{finding.county}</div>
                <div className="text-xs text-muted-foreground">{finding.message}</div>
              </div>
              <div className="text-xs text-muted-foreground">{finding.time}</div>
              <div className="text-xs font-medium">{finding.confidence}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
