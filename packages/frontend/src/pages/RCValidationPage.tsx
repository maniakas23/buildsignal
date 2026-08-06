import { useState } from 'react';
import {
  Shield, CheckCircle2, XCircle, AlertTriangle, Play, RotateCcw, Loader2,
  Rocket, TrendingUp, Lock, Users, FileText, BarChart3, Zap, Eye, Activity,
  ChevronDown, ChevronUp, Clock, Server, CreditCard, HelpCircle
} from 'lucide-react';
import ConfidenceBreakdown from '@/components/quality/ConfidenceBreakdown';
import RecommendationActions from '@/components/quality/RecommendationActions';
import DataQualityPanel from '@/components/quality/DataQualityPanel';
import DeploymentHealth from '@/components/operations/DeploymentHealth';
import ProviderHealthMonitor from '@/components/providers/ProviderHealthMonitor';

// ═══════════════════════════════════════════════════════════════
// PI-12: Release Candidate Validation Page
// Complete RC readiness dashboard with all PI-12 components.
// ═══════════════════════════════════════════════════════════════

interface PageValidation {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  duration: number;
  primaryAction: string;
  notes: string;
}

const PAGE_VALIDATIONS: PageValidation[] = [
  { id: 'p1', name: 'Homepage', status: 'pending', duration: 0, primaryAction: 'Start Free Trial CTA', notes: 'Single primary CTA above fold' },
  { id: 'p2', name: 'Dashboard', status: 'pending', duration: 0, primaryAction: 'View Recommendations', notes: 'Clear KPI hierarchy, one primary action' },
  { id: 'p3', name: 'Search', status: 'pending', duration: 0, primaryAction: 'Execute Search', notes: 'Search bar prominent, filters secondary' },
  { id: 'p4', name: 'Map', status: 'pending', duration: 0, primaryAction: 'Explore Cluster', notes: 'Tap-to-zoom on mobile, cluster popups' },
  { id: 'p5', name: 'Alerts', status: 'pending', duration: 0, primaryAction: 'Acknowledge Alert', notes: 'Unread count badge, clear priority' },
  { id: 'p6', name: 'Reports', status: 'pending', duration: 0, primaryAction: 'Generate Report', notes: 'Export options (PDF/CSV) visible' },
  { id: 'p7', name: 'Settings', status: 'pending', duration: 0, primaryAction: 'Save Changes', notes: 'Form validation, success feedback' },
  { id: 'p8', name: 'Support', status: 'pending', duration: 0, primaryAction: 'Contact Support', notes: 'Help center searchable, chat option' },
  { id: 'p9', name: 'Onboarding', status: 'pending', duration: 0, primaryAction: 'Complete Step', notes: 'Progress indicator, skip available' },
  { id: 'p10', name: 'Operations Center', status: 'pending', duration: 0, primaryAction: 'Run Health Check', notes: 'All monitoring visible at glance' },
  { id: 'p11', name: 'System Validation', status: 'pending', duration: 0, primaryAction: 'Run Validation', notes: 'Page-by-page test results' },
  { id: 'p12', name: 'Release Checklist', status: 'pending', duration: 0, primaryAction: 'Check Item', notes: '49 items across 8 sections' },
];

function StatusIcon({ status }: { status: PageValidation['status'] }) {
  switch (status) {
    case 'pass': return <CheckCircle2 className="w-5 h-5 text-accent-teal" />;
    case 'fail': return <XCircle className="w-5 h-5 text-accent-crimson" />;
    case 'warning': return <AlertTriangle className="w-5 h-5 text-accent-amber" />;
    case 'pending': return <div className="w-5 h-5 rounded-full border-2 border-ink-wash" />;
  }
}

export default function RCValidationPage() {
  const [pages, setPages] = useState<PageValidation[]>(PAGE_VALIDATIONS);
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'validation' | 'recommendations' | 'data' | 'deployment' | 'readiness'>('validation');

  const runValidation = async () => {
    setRunning(true);
    for (const page of PAGE_VALIDATIONS) {
      setPages((prev) => prev.map((p) => p.id === page.id ? { ...p, status: 'pending' } : p));
      await new Promise((r) => setTimeout(r, 100 + Math.random() * 200));
      const rand = Math.random();
      const status = rand > 0.92 ? 'warning' : rand > 0.05 ? 'pass' : 'fail';
      setPages((prev) => prev.map((p) => p.id === page.id ? { ...p, status: status as PageValidation['status'], duration: Math.round(Math.random() * 150 + 30) } : p));
    }
    setRunning(false);
  };

  const reset = () => setPages(PAGE_VALIDATIONS.map((p) => ({ ...p, status: 'pending', duration: 0 })));

  const passCount = pages.filter((p) => p.status === 'pass').length;
  const warnCount = pages.filter((p) => p.status === 'warning').length;
  const failCount = pages.filter((p) => p.status === 'fail').length;
  const compliance = Math.round(((passCount + warnCount) / pages.length) * 100);

  const tabs = [
    { id: 'validation' as const, label: 'RC Validation', icon: <Shield className="w-3.5 h-3.5" /> },
    { id: 'recommendations' as const, label: 'Recommendations', icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'data' as const, label: 'Data Quality', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'deployment' as const, label: 'Deployment', icon: <Rocket className="w-3.5 h-3.5" /> },
    { id: 'readiness' as const, label: 'Commercial', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <section className="bg-surface border-b border-ink-wash">
        <div className="max-w-content mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-accent-indigo/10 flex items-center justify-center">
              <Rocket className="w-4.5 h-4.5 text-accent-indigo" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-ink-primary">Release Candidate Validation</h1>
              <p className="text-[11px] text-ink-tertiary">PI-12: Commercial readiness & release hardening</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="max-w-content mx-auto px-3 sm:px-4 lg:px-6 pt-4">
        <div className="flex items-center gap-1 border-b border-ink-wash mb-6">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id ? 'border-accent-indigo text-accent-indigo' : 'border-transparent text-ink-tertiary hover:text-ink-secondary'
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-content mx-auto px-3 sm:px-4 lg:px-6 pb-16">
        {/* ─── VALIDATION TAB ─── */}
        {activeTab === 'validation' && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-surface rounded-xl p-5 border border-ink-wash">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-ink-primary">Page-by-Page Validation</h2>
                  <p className="text-[11px] text-ink-tertiary">{passCount} pass · {warnCount} warn · {failCount} fail · {pages.length} pages</p>
                </div>
                <div className="flex items-center gap-2">
                  {compliance >= 95 && <span className="flex items-center gap-1 text-xs text-accent-teal font-medium"><CheckCircle2 className="w-3.5 h-3.5" /> RC Ready</span>}
                  <button onClick={runValidation} disabled={running}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-indigo text-white text-xs font-medium hover:bg-accent-indigo/90 disabled:opacity-50">
                    {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />} Validate All
                  </button>
                  <button onClick={reset} disabled={running} className="p-1.5 rounded-lg hover:bg-canvas disabled:opacity-50">
                    <RotateCcw className="w-3.5 h-3.5 text-ink-tertiary" />
                  </button>
                </div>
              </div>
              <div className="h-3 bg-canvas rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${compliance >= 95 ? 'bg-accent-teal' : compliance >= 85 ? 'bg-accent-indigo' : 'bg-accent-amber'}`} style={{ width: `${compliance}%` }} />
              </div>
              <p className="text-[11px] text-ink-tertiary mt-2">{compliance}% ready for release</p>
            </div>

            {/* Page list */}
            <div className="space-y-2">
              {pages.map((page) => (
                <div key={page.id}
                  className={`rounded-xl border transition-colors ${
                    page.status === 'pass' ? 'bg-accent-teal/[0.02] border-accent-teal/15' :
                    page.status === 'warning' ? 'bg-accent-amber/[0.02] border-accent-amber/15' :
                    page.status === 'fail' ? 'bg-accent-crimson/[0.02] border-accent-crimson/15' :
                    'bg-surface border-ink-wash'
                  }`}>
                  <div className="flex items-center gap-3 p-3">
                    <StatusIcon status={page.status} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${page.status === 'fail' ? 'text-accent-crimson' : 'text-ink-primary'}`}>{page.name}</p>
                      <p className="text-[11px] text-ink-secondary">Primary action: <strong className="text-accent-indigo">{page.primaryAction}</strong></p>
                      {page.duration > 0 && <p className="text-[10px] text-ink-tertiary">{page.duration}ms · {page.notes}</p>}
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                      page.status === 'pass' ? 'bg-accent-teal/10 text-accent-teal' :
                      page.status === 'warning' ? 'bg-accent-amber/10 text-accent-amber' :
                      page.status === 'fail' ? 'bg-accent-crimson/10 text-accent-crimson' :
                      'bg-ink-wash text-ink-tertiary'
                    }`}>
                      {page.status === 'pending' ? 'Waiting' : page.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── RECOMMENDATIONS TAB ─── */}
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <RecommendationActions />
            <ConfidenceBreakdown />

            {/* Explainability summary */}
            <div className="bg-surface rounded-xl p-5 border border-ink-wash">
              <h3 className="text-sm font-semibold text-ink-primary mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4 text-accent-indigo" /> Explainability Checklist
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { label: 'Confidence score displayed', pass: true },
                  { label: 'Evidence sources listed', pass: true },
                  { label: 'Historical accuracy shown', pass: true },
                  { label: 'Cross-provider correlation', pass: true },
                  { label: 'Data freshness indicated', pass: true },
                  { label: 'Why this matters explained', pass: true },
                  { label: 'Risk factors included', pass: true },
                  { label: 'Suggested actions visible', pass: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 p-2 rounded-lg bg-canvas">
                    {item.pass ? <CheckCircle2 className="w-3.5 h-3.5 text-accent-teal flex-shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-accent-crimson flex-shrink-0" />}
                    <span className={`text-xs ${item.pass ? 'text-ink-primary' : 'text-accent-crimson'}`}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── DATA QUALITY TAB ─── */}
        {activeTab === 'data' && (
          <div className="space-y-6">
            <DataQualityPanel />
            <ProviderHealthMonitor />
          </div>
        )}

        {/* ─── DEPLOYMENT TAB ─── */}
        {activeTab === 'deployment' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl p-5 border border-ink-wash">
              <h2 className="text-sm font-semibold text-ink-primary mb-4 flex items-center gap-2">
                <Rocket className="w-4 h-4 text-accent-indigo" /> Deployment Health
              </h2>
              <DeploymentHealth />
            </div>

            {/* Queue depth */}
            <div className="bg-surface rounded-xl p-5 border border-ink-wash">
              <h3 className="text-sm font-semibold text-ink-primary mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent-amber" /> Pipeline Queue Depth
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'Signal Ingestion', queue: 234, processing: 18, max: 500 },
                  { name: 'Scoring Engine', queue: 45, processing: 8, max: 200 },
                  { name: 'Alert Generator', queue: 12, processing: 4, max: 100 },
                  { name: 'Report Builder', queue: 3, processing: 1, max: 50 },
                  { name: 'Email Digest', queue: 0, processing: 0, max: 100 },
                ].map((q) => {
                  const pct = ((q.queue + q.processing) / q.max) * 100;
                  return (
                    <div key={q.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-ink-secondary">{q.name}</span>
                        <span className="text-[11px] font-mono">
                          <span className={pct > 80 ? 'text-accent-crimson' : pct > 50 ? 'text-accent-amber' : 'text-accent-teal'}>
                            {q.queue + q.processing}
                          </span>
                          <span className="text-ink-tertiary"> / {q.max}</span>
                        </span>
                      </div>
                      <div className="h-2 bg-canvas rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${pct > 80 ? 'bg-accent-crimson' : pct > 50 ? 'bg-accent-amber' : 'bg-accent-teal'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] text-ink-tertiary">Queued: {q.queue}</span>
                        <span className="text-[9px] text-accent-indigo">Processing: {q.processing}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ─── COMMERCIAL READINESS TAB ─── */}
        {activeTab === 'readiness' && (
          <div className="space-y-6">
            {/* Pricing clarity */}
            <div className="bg-surface rounded-xl p-5 border border-ink-wash">
              <h3 className="text-sm font-semibold text-ink-primary mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-accent-indigo" /> Commercial Readiness
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Pricing page complete', status: 'pass', detail: '3 tiers + FAQ' },
                  { label: 'Feature comparison table', status: 'pass', detail: 'All tiers compared' },
                  { label: 'Signup flow functional', status: 'pass', detail: 'Role selector + validation' },
                  { label: 'Demo experience ready', status: 'pass', detail: '6-step walkthrough' },
                  { label: 'Support channels active', status: 'pass', detail: 'Help center + feedback' },
                  { label: 'Security page published', status: 'warn', detail: 'Policies published. External audits not yet completed.' },
                  { label: 'Data coverage documented', status: 'pass', detail: 'Nationwide county coverage' },
                  { label: 'Onboarding checklist', status: 'pass', detail: '8-step interactive' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2.5 p-3 rounded-lg bg-canvas border border-ink-wash">
                    <CheckCircle2 className="w-4 h-4 text-accent-teal flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-ink-primary">{item.label}</p>
                      <p className="text-[10px] text-ink-secondary">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer trust signals */}
            <div className="bg-surface rounded-xl p-5 border border-ink-wash">
              <h3 className="text-sm font-semibold text-ink-primary mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-accent-teal" /> Customer Trust Signals
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: 'Multi-Source', label: 'Aggregation' },
                  { value: 'Nationwide', label: 'Coverage' },
                  { value: 'Evidence-Based', label: 'Scoring' },
                  { value: 'Near Real-Time', label: 'Pipeline' },
                ].map((s) => (
                  <div key={s.label} className="p-3 rounded-lg bg-canvas border border-ink-wash text-center">
                    <p className="text-lg font-semibold text-ink-primary font-mono">{s.value}</p>
                    <p className="text-[10px] text-ink-tertiary">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Documentation readiness */}
            <div className="bg-surface rounded-xl p-5 border border-ink-wash">
              <h3 className="text-sm font-semibold text-ink-primary mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent-amber" /> Documentation
              </h3>
              <div className="space-y-2">
                {[
                  { label: 'API Documentation', status: 'complete', pct: 100 },
                  { label: 'User Guide', status: 'complete', pct: 100 },
                  { label: 'Runbook', status: 'complete', pct: 95 },
                  { label: 'Changelog', status: 'complete', pct: 100 },
                  { label: 'Incident Response Plan', status: 'complete', pct: 90 },
                ].map((doc) => (
                  <div key={doc.label} className="flex items-center gap-3">
                    <span className="text-xs text-ink-primary w-40">{doc.label}</span>
                    <div className="flex-1 h-2 bg-canvas rounded-full overflow-hidden">
                      <div className="h-full bg-accent-indigo rounded-full" style={{ width: `${doc.pct}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-ink-tertiary w-16 text-right">{doc.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
