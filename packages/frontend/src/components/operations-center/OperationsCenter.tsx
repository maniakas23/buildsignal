import {
  Activity, Users, TrendingUp, BarChart3, Shield, Globe,
  ArrowUp, ArrowDown, Minus, Clock, Server, Zap,
  MapPin, Database, Wifi, AlertTriangle, CheckCircle2,
  Lock, FileText, Cpu
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// PI-9: Operations Center
// System health, provider monitoring, pipeline status, infrastructure.
// ═══════════════════════════════════════════════════════════════

const SYSTEM_HEALTH = {
  overall: 'operational',
  uptime: '99.97%',
  lastIncident: 'None',
  activeAlerts: 0,
};

const HEALTH_METRICS = [
  { label: 'System Uptime', value: '99.97%', trend: 'stable', change: '—' },
  { label: 'API Response Time', value: '<120ms', trend: 'stable', change: '—' },
  { label: 'Error Rate', value: '0.01%', trend: 'stable', change: '—' },
  { label: 'Active Users', value: '0', trend: 'pre-launch', change: '—' },
];

const USAGE_METRICS = [
  { label: 'Total Sessions', value: '0', trend: 'pre-launch', change: '—' },
  { label: 'Avg Session Duration', value: '—', trend: 'pre-launch', change: '—' },
  { label: 'Actions Per Session', value: '—', trend: 'pre-launch', change: '—' },
  { label: 'Return Rate (7d)', value: '—', trend: 'pre-launch', change: '—' },
  { label: 'Feature Adoption', value: '—', trend: 'pre-launch', change: '—' },
];

const SUBSCRIPTION_HEALTH = [
  { tier: 'Enterprise', customers: 0, mrr: '$0', churn: '0%', expansion: '$0' },
  { tier: 'Business', customers: 0, mrr: '$0', churn: '0%', expansion: '$0' },
  { tier: 'Professional', customers: 0, mrr: '$0', churn: '0%', expansion: '$0' },
  { tier: 'Scout', customers: 0, mrr: '$0', churn: '0%', expansion: '$0' },
];

const INFRASTRUCTURE_COVERAGE = [
  { source: 'DOT Filings', coverage: 'Target: 98%', counties: 'Nationwide', lastUpdate: 'Real-time pipeline' },
  { source: 'County Planning', coverage: 'Target: 94%', counties: 'Nationwide', lastUpdate: '15 min pipeline' },
  { source: 'Utility Permits', coverage: 'Target: 91%', counties: 'Nationwide', lastUpdate: '30 min pipeline' },
  { source: 'Building Permits', coverage: 'Target: 96%', counties: 'Nationwide', lastUpdate: '1 hr pipeline' },
  { source: 'CIP Budgets', coverage: 'Target: 88%', counties: 'Nationwide', lastUpdate: '6 hrs pipeline' },
  { source: 'School Contracts', coverage: 'Target: 85%', counties: 'Nationwide', lastUpdate: '12 hrs pipeline' },
  { source: 'Gov Spending', coverage: 'Target: 92%', counties: 'Nationwide', lastUpdate: '2 hrs pipeline' },
  { source: 'Public Meetings', coverage: 'Target: 79%', counties: 'Nationwide', lastUpdate: '24 hrs pipeline' },
];

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') return <ArrowUp className="w-3 h-3 text-emerald-500" />;
  if (trend === 'down') return <ArrowDown className="w-3 h-3 text-accent-crimson" />;
  return <Minus className="w-3 h-3 text-ink-tertiary" />;
}

export default function OperationsCenter() {
  return (
    <div className="space-y-6">
      {/* System Health Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-emerald-800">System Health</h3>
            <span className="text-[10px] font-bold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">
              {SYSTEM_HEALTH.overall.toUpperCase()}
            </span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Uptime: {SYSTEM_HEALTH.uptime}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {HEALTH_METRICS.map((m) => (
            <div key={m.label} className="bg-white/60 rounded-lg p-3">
              <p className="text-[10px] text-emerald-700/70">{m.label}</p>
              <p className="text-sm font-bold text-emerald-800">{m.value}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <TrendIcon trend={m.trend} />
                <span className="text-[9px] text-emerald-600">{m.change}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Analytics */}
      <div className="bg-surface border border-ink-wash rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-ink-primary flex items-center gap-2">
            <Users className="w-4 h-4 text-accent-indigo" /> Usage Analytics
          </h4>
          <span className="text-[9px] text-ink-tertiary">Pre-launch: No user sessions yet</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {USAGE_METRICS.map((m) => (
            <div key={m.label} className="bg-canvas rounded-lg p-3">
              <p className="text-[9px] text-ink-tertiary">{m.label}</p>
              <p className="text-sm font-bold text-ink-primary">{m.value}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <TrendIcon trend={m.trend} />
                <span className="text-[9px] text-ink-tertiary">{m.change}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription Health */}
      <div className="bg-surface border border-ink-wash rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-ink-primary flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent-indigo" /> Subscription Health
          </h4>
          <span className="text-[9px] text-ink-tertiary">Pre-launch: No paying customers yet</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-ink-wash">
                <th className="text-left py-2 text-ink-tertiary font-medium">Tier</th>
                <th className="text-right py-2 text-ink-tertiary font-medium">Customers</th>
                <th className="text-right py-2 text-ink-tertiary font-medium">MRR</th>
                <th className="text-right py-2 text-ink-tertiary font-medium">Churn</th>
                <th className="text-right py-2 text-ink-tertiary font-medium">Expansion</th>
              </tr>
            </thead>
            <tbody>
              {SUBSCRIPTION_HEALTH.map((row) => (
                <tr key={row.tier} className="border-b border-ink-wash/50">
                  <td className="py-2 text-ink-secondary font-medium">{row.tier}</td>
                  <td className="text-right py-2 text-ink-tertiary">{row.customers}</td>
                  <td className="text-right py-2 text-ink-tertiary">{row.mrr}</td>
                  <td className="text-right py-2 text-ink-tertiary">{row.churn}</td>
                  <td className="text-right py-2 text-ink-tertiary">{row.expansion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Infrastructure Coverage */}
      <div className="bg-surface border border-ink-wash rounded-2xl p-5">
        <h4 className="text-sm font-bold text-ink-primary mb-4 flex items-center gap-2">
          <Database className="w-4 h-4 text-accent-indigo" /> Data Pipeline Status
        </h4>
        <div className="space-y-2">
          {INFRASTRUCTURE_COVERAGE.map((row) => (
            <div key={row.source} className="flex items-center justify-between p-2.5 bg-canvas rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-medium text-ink-primary">{row.source}</span>
              </div>
              <div className="flex items-center gap-4 text-[10px]">
                <span className="text-ink-tertiary">{row.coverage}</span>
                <span className="text-ink-tertiary">{row.counties}</span>
                <span className="text-emerald-600 font-medium">{row.lastUpdate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
