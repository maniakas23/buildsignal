import { useStore } from '@/store/useStore';
import { Suspense, lazy } from 'react';
import {
  Shield, TrendingUp, MapPin, Clock, Users, Award,
  ArrowRight, CheckCircle2, Zap, Building2, HardHat,
  Truck, PenTool, Star, BarChart3, Lock, Globe, FileText
} from 'lucide-react';

const FlowCanvas = lazy(() => import('@/components/FlowCanvas'));

const TRUST_METRICS = [
  { value: 'Nationwide', label: 'US Coverage', icon: <MapPin className="w-4 h-4" /> },
  { value: 'Multi-Source', label: 'Signal Aggregation', icon: <Zap className="w-4 h-4" /> },
  { value: 'Evidence-Based', label: 'Confidence Scoring', icon: <CheckCircle2 className="w-4 h-4" /> },
  { value: 'Near Real-Time', label: 'Data Pipeline', icon: <Clock className="w-4 h-4" /> },
];

const FEATURES = [
  {
    icon: <TrendingUp className="w-6 h-6 text-accent-indigo" />,
    title: 'AI-Ranked Opportunities',
    description: 'Machine learning models score every opportunity by confidence, ROI potential, and market timing.',
  },
  {
    icon: <MapPin className="w-6 h-6 text-accent-teal" />,
    title: 'Interactive Intelligence Map',
    description: 'Explore opportunities geographically with real-time signal overlays and county-level detail.',
  },
  {
    icon: <Zap className="w-6 h-6 text-accent-amber" />,
    title: 'Predictive Surge Alerts',
    description: 'Get notified when early signals appear — permits, zoning changes, and utility filings that indicate upcoming projects.',
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-accent-crimson" />,
    title: 'Market Intelligence Reports',
    description: 'Generate detailed reports with market context, infrastructure signals, and risk analysis.',
  },
  {
    icon: <Shield className="w-6 h-6 text-accent-indigo" />,
    title: 'Explainable AI',
    description: 'Every recommendation includes a confidence breakdown with transparent evidence sources.',
  },
  {
    icon: <Clock className="w-6 h-6 text-accent-teal" />,
    title: 'Real-Time Data Pipeline',
    description: 'Continuous ingestion from permits, zoning boards, utility filings, and public records.',
  },
];

const STEPS = [
  { num: '01', title: 'Select Your Counties', description: 'Choose the geographic areas you want to monitor.' },
  { num: '02', title: 'AI Analyzes Signals', description: 'Kestovar processes permits, zoning changes, and utility data.' },
  { num: '03', title: 'Act on Opportunities', description: 'Review ranked recommendations with confidence scores and ROI projections.' },
];

const USE_CASES = [
  { icon: <Building2 className="w-5 h-5" />, title: 'General Contractors', description: 'Find projects before they go to bid' },
  { icon: <HardHat className="w-5 h-5" />, title: 'Subcontractors', description: 'Get early visibility into prime contracts' },
  { icon: <Truck className="w-5 h-5" />, title: 'Suppliers', description: 'Identify material demand signals' },
  { icon: <PenTool className="w-5 h-5" />, title: 'Developers', description: 'Track zoning and permitting trends' },
];

export default function Home() {
  const { setCurrentPage } = useStore();

  return (
    <div className="min-h-screen bg-canvas">
      {/* ─── Hero Section ─── */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: '500px' }}>
        <div className="absolute inset-0 z-0">
          <Suspense fallback={<div className="w-full h-full bg-accent-indigo/5" />}>
            <FlowCanvas />
          </Suspense>
        </div>
        <div className="absolute inset-0 z-[1]" style={{ background: 'linear-gradient(180deg, rgba(8,12,16,0.3) 0%, rgba(8,12,16,0.6) 60%, rgba(8,12,16,0.95) 100%)' }} />

        <div className="relative z-[2] max-w-content mx-auto px-6 py-20 sm:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-indigo/10 border border-accent-indigo/20 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-teal animate-pulse" />
              <span className="text-xs text-accent-indigo font-medium">Nationwide permit and zoning intelligence</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight mb-5">
              Win More Construction Projects With{' '}
              <span className="text-accent-indigo">Early Signal Intelligence</span>
            </h1>

            <p className="text-base sm:text-lg text-white/70 leading-relaxed mb-8 max-w-xl">
              BuildSignal uses AI to detect early construction signals — permits, zoning changes, and utility filings — so you can connect with decision-makers before your competitors know a project exists.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setCurrentPage('signup')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-indigo text-white font-medium hover:bg-accent-indigo/90 transition-colors shadow-lg shadow-accent-indigo/20"
              >
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage('map')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.1] backdrop-blur text-white font-medium hover:bg-white/[0.15] transition-colors border border-white/[0.15]"
              >
                <MapPin className="w-4 h-4" /> Explore the Map
              </button>
            </div>

            <p className="text-xs text-white/40 mt-4">No credit card required. 14-day free trial.</p>
          </div>
        </div>
      </section>

      {/* ─── Trust Metrics Bar ─── */}
      <section className="border-y border-ink-wash bg-surface">
        <div className="max-w-content mx-auto px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRUST_METRICS.map((m) => (
              <div key={m.label} className="flex items-center gap-3">
                <span className="text-accent-indigo">{m.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-ink-primary font-mono">{m.value}</p>
                  <p className="text-[11px] text-ink-tertiary">{m.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="max-w-content mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-ink-primary mb-2">How BuildSignal Works</h2>
          <p className="text-sm text-ink-secondary">From signal detection to actionable opportunity in three steps</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((step) => (
            <div key={step.num} className="text-center p-6">
              <span className="text-3xl font-bold text-accent-indigo/20 font-mono">{step.num}</span>
              <h3 className="text-base font-semibold text-ink-primary mt-3 mb-2">{step.title}</h3>
              <p className="text-sm text-ink-secondary leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section className="bg-surface border-y border-ink-wash">
        <div className="max-w-content mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-ink-primary mb-2">Everything You Need to Win</h2>
            <p className="text-sm text-ink-secondary">A complete intelligence platform for construction opportunity discovery</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="p-5 rounded-2xl bg-canvas border border-ink-wash hover:border-accent-indigo/20 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-accent-indigo/[0.06] flex items-center justify-center mb-3">
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold text-ink-primary mb-1.5">{f.title}</h3>
                <p className="text-xs text-ink-secondary leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Factual Trust Section ─── */}
      <section className="max-w-content mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-ink-primary mb-2">Built with Transparency</h2>
          <p className="text-sm text-ink-secondary">We believe in showing evidence, not making claims.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-surface rounded-2xl p-5 border border-ink-wash text-center">
            <Shield className="w-8 h-8 text-accent-teal mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-ink-primary mb-1">Encrypted Connections</h3>
            <p className="text-xs text-ink-tertiary">TLS 1.3 for all data in transit</p>
          </div>
          <div className="bg-surface rounded-2xl p-5 border border-ink-wash text-center">
            <Lock className="w-8 h-8 text-accent-indigo mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-ink-primary mb-1">Role-Based Access</h3>
            <p className="text-xs text-ink-tertiary">Organization and workspace scoping</p>
          </div>
          <div className="bg-surface rounded-2xl p-5 border border-ink-wash text-center">
            <Globe className="w-8 h-8 text-accent-amber mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-ink-primary mb-1">Cloudflare-Hosted</h3>
            <p className="text-xs text-ink-tertiary">Global edge network, zero cold starts</p>
          </div>
          <div className="bg-surface rounded-2xl p-5 border border-ink-wash text-center">
            <FileText className="w-8 h-8 text-accent-slate mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-ink-primary mb-1">Audit Logging</h3>
            <p className="text-xs text-ink-tertiary">Complete data access history</p>
          </div>
        </div>
      </section>

      {/* ─── Use Cases ─── */}
      <section className="bg-surface border-y border-ink-wash">
        <div className="max-w-content mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-ink-primary mb-2">Built For Every Role</h2>
            <p className="text-sm text-ink-secondary">Whether you bid, build, supply, or develop</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {USE_CASES.map((u) => (
              <div key={u.title} className="p-5 rounded-2xl bg-canvas border border-ink-wash text-center">
                <div className="w-10 h-10 rounded-xl bg-accent-indigo/10 flex items-center justify-center mx-auto mb-3 text-accent-indigo">
                  {u.icon}
                </div>
                <h3 className="text-sm font-semibold text-ink-primary mb-1">{u.title}</h3>
                <p className="text-xs text-ink-secondary">{u.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Enterprise Trust ─── */}
      <section className="max-w-content mx-auto px-6 py-12">
        <div className="flex flex-wrap items-center justify-center gap-6 text-ink-tertiary">
          <span className="flex items-center gap-1.5 text-xs">
            <Shield className="w-3.5 h-3.5" /> Role-Based Access Control
          </span>
          <span className="flex items-center gap-1.5 text-xs">
            <Lock className="w-3.5 h-3.5" /> TLS 1.3 Encrypted
          </span>
          <span className="flex items-center gap-1.5 text-xs">
            <Globe className="w-3.5 h-3.5" /> Cloudflare Edge Network
          </span>
          <span className="flex items-center gap-1.5 text-xs">
            <FileText className="w-3.5 h-3.5" /> Audit Logging
          </span>
          <span className="flex items-center gap-1.5 text-xs">
            <Users className="w-3.5 h-3.5" /> Kimi OAuth SSO
          </span>
        </div>
      </section>

      {/* ─── CTA Footer ─── */}
      <section className="bg-accent-indigo/[0.04] border-t border-accent-indigo/10">
        <div className="max-w-content mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl font-bold text-ink-primary mb-3">
            Start Finding Opportunities Today
          </h2>
          <p className="text-sm text-ink-secondary mb-6 max-w-md mx-auto">
            Start discovering infrastructure intelligence with BuildSignal today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setCurrentPage('pricing')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-indigo text-white font-medium hover:bg-accent-indigo/90 transition-colors shadow-lg shadow-accent-indigo/20"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage('pricing')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface border border-ink-wash text-ink-primary font-medium hover:bg-canvas transition-colors"
            >
              View Pricing
            </button>
          </div>
          <p className="text-xs text-ink-tertiary mt-4">No credit card required to explore.</p>
        </div>
      </section>
    </div>
  );
}
