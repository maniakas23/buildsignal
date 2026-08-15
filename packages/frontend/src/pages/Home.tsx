import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Check, Mail, Phone, Shield, Lock, Eye,
  TrendingUp, MapPin, FileText, BarChart3, Users, Zap,
  Download, Search, Filter, Presentation, Building2,
  LocateFixed, Mountain, Handshake,
} from "lucide-react";
import { CredibilityBar } from "@/components/marketing/CredibilityBar";
import { MarketPulseDemo } from "@/components/marketing/MarketPulseDemo";
import { ROICalculator } from "@/components/marketing/ROICalculator";
import { HomeFAQ } from "@/components/marketing/HomeFAQ";

export default function Home() {
  const [email, setEmail] = useState("");

  const steps = [
    { number: "01", title: "Capture", description: "Select counties, metros, and asset classes. Our system monitors municipal permits, zoning filings, and infrastructure investments across your target markets.", icon: Search },
    { number: "02", title: "Filter", description: "Apply intelligent filters by permit type, project value, timeline, and geography. Set custom alert thresholds to surface only the opportunities that match your strategy.", icon: Filter },
    { number: "03", title: "Present", description: "Receive actionable reports with confidence scores, trend visualizations, and clear next steps. Export to PDF, share with your team, or integrate via API.", icon: Presentation },
  ];

  const capabilities = [
    { icon: MapPin, title: "County Coverage", description: "Monitor construction activity across covered US counties with daily data aggregation and automated coverage expansion." },
    { icon: FileText, title: "Permit Tracking", description: "Track municipal building permits in real time. Filter by type, value, and geography to find relevant opportunities." },
    { icon: BarChart3, title: "AI Predictions", description: "Machine learning models forecast construction surges with confidence scores. Methodology documented and transparent." },
    { icon: Users, title: "User Analytics", description: "Per-account metrics and reporting dashboards. Track your research activity, saved searches, and team engagement." },
    { icon: Zap, title: "ROI Tools", description: "Investment analysis and market comparison tools. Evaluate opportunity costs and projected returns across target regions." },
    { icon: Download, title: "Reports & Exports", description: "Generate polished PDF and API exports with one click. Custom branding, charts, and narrative summaries included." },
  ];

  const useCases = [
    { icon: Building2, title: "Commercial Real Estate", description: "Spot emerging submarkets before land prices surge. Track permit velocity, zoning changes, and infrastructure investments across your target regions to identify development opportunities early." },
    { icon: LocateFixed, title: "Site Selection", description: "Deliver data-backed location recommendations with confidence scores. Compare markets on growth trajectory, labor availability, and regulatory climate to make informed decisions." },
    { icon: Mountain, title: "Land Investors", description: "Identify counties with accelerating construction activity. Get early signals on where demand is heating up so you can acquire ahead of the curve and maximize returns." },
    { icon: Handshake, title: "Commercial Brokers", description: "Know which markets are primed for leasing activity before your competitors. Use permit data to time your outreach and win more listings in high-growth areas." },
  ];

  const plans = [
    { name: "Scout", price: "$99", period: "/month", description: "Perfect for individual investors and small teams exploring new markets.", features: ["5 counties", "Weekly email reports", "Basic predictions", "Email support"], highlighted: false },
    { name: "Professional", price: "$249", period: "/month", description: "For growing teams that need deeper intelligence and more coverage.", features: ["25 counties", "Daily alerts + weekly briefings", "Advanced predictions", "API access", "Priority support"], highlighted: true },
    { name: "Business", price: "$599", period: "/month", description: "Built for organizations managing multi-market portfolios at scale.", features: ["Unlimited counties", "Real-time alerts", "Custom models", "Full API + webhooks", "SSO & SAML", "Dedicated account manager"], highlighted: false },
  ];

  return (
    <main className="min-h-screen bg-canvas">
      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-6">
            <TrendingUp className="w-4 h-4" />
            <span>Now tracking 3,200+ US counties</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-ink mb-6 tracking-tight">
            Predict Construction Surges<br className="hidden md:block" /> Before Your Competitors
          </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto mb-8">
            AI-powered infrastructure intelligence for construction markets. Get actionable permit insights, growth forecasts, and market opportunities delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="inline-flex items-center justify-center px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors">
              Start 14-Day Free Trial<ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <button className="inline-flex items-center justify-center px-8 py-3 bg-surface hover:bg-surface-hover text-ink font-semibold rounded-lg border border-border transition-colors">
              Watch Demo
            </button>
          </div>
          <p className="text-sm text-muted mt-4">No credit card required. Cancel anytime.</p>
        </div>
      </section>

      <CredibilityBar />

      {/* How BuildSignal Works */}
      <section className="py-20 md:py-28 bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-ink mb-4">How BuildSignal Works</h2>
            <p className="text-lg text-muted">From Data to Decision in Three Steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <div key={step.number} className="relative">
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-border -translate-y-1/2" />
                )}
                <div className="text-5xl font-bold text-emerald-500/20 mb-4">{step.number}</div>
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                  <step.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-ink mb-2">{step.title}</h3>
                <p className="text-muted leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Capabilities */}
      <section className="py-20 md:py-28 bg-canvas">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-4">
              <Zap className="w-4 h-4" /><span>Platform Capabilities</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-ink mb-4">What BuildSignal Delivers</h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">Core capabilities of the platform. Actual coverage and performance metrics are available to authenticated users.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap) => (
              <div key={cap.title} className="bg-surface border border-border rounded-2xl p-6 hover:border-emerald-500/30 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                  <cap.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-ink mb-2">{cap.title}</h3>
                <p className="text-muted leading-relaxed">{cap.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MarketPulseDemo />

      {/* Use Cases */}
      <section className="py-20 md:py-28 bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-4">
              <Users className="w-4 h-4" /><span>Use Cases</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-ink mb-4">Built for Every Player in the Construction Ecosystem</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {useCases.map((uc) => (
              <div key={uc.title} className="bg-canvas border border-border rounded-2xl p-6">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                  <uc.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-ink mb-2">{uc.title}</h3>
                <p className="text-muted leading-relaxed">{uc.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ROICalculator />

      {/* Pricing Tiers */}
      <section id="pricing" className="py-20 md:py-28 bg-canvas">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-ink mb-4">Pricing</h2>
            <p className="text-lg text-muted">Simple Pricing, Powerful Results</p>
            <p className="text-sm text-muted mt-2">Start with a 14-day free trial. No credit card required. Upgrade or cancel anytime.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.name} className={`bg-surface border rounded-2xl p-6 ${plan.highlighted ? "border-emerald-500/50 shadow-lg shadow-emerald-500/5" : "border-border"}`}>
                {plan.highlighted && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium mb-4">Most Popular</div>
                )}
                <h3 className="text-xl font-semibold text-ink mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold text-ink">{plan.price}</span>
                  <span className="text-muted">{plan.period}</span>
                </div>
                <p className="text-sm text-muted mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />{feature}
                    </li>
                  ))}
                </ul>
                <Link to="/signup" className={`block w-full text-center px-4 py-2 rounded-lg font-semibold transition-colors ${plan.highlighted ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-canvas hover:bg-surface-hover text-ink border border-border"}`}>
                  Start Free Trial
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HomeFAQ />

      {/* Newsletter */}
      <section className="py-20 md:py-28 bg-surface">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-ink mb-4">Stay Ahead of the Market</h2>
          <p className="text-muted mb-8">Get weekly insights on construction market trends and new feature updates.</p>
          <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => { e.preventDefault(); }}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-canvas border border-border rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            <button type="submit" className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors">Subscribe</button>
          </form>
        </div>
      </section>

      {/* Trust and Contact */}
      <section className="py-20 md:py-28 bg-canvas border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-ink mb-4">Trust and Contact</h2>
            <p className="text-lg text-muted">Enterprise-Grade Security and Support</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "SOC 2 Type II (In Progress)", desc: "Security controls aligned to SOC 2 Type II. Certification audit not yet completed — not verified." },
              { icon: Lock, title: "256-bit Encryption", desc: "AES-256 encryption at rest and in transit. Your data is never sold or shared with third parties." },
              { icon: Eye, title: "No Data Selling", desc: "We never sell, rent, or share your proprietary data with external parties. Your intelligence stays yours." },
              { icon: Mail, title: "Email Support", desc: "Reach our team at support@buildsignal.net. We typically respond within one business day." },
              { icon: Phone, title: "Phone Support", desc: "Available for Business plan customers. Contact support to schedule a call with our team." },
              { icon: FileText, title: "Contact Page", desc: "Visit our contact page for general inquiries, partnership requests, and media relations." },
            ].map((item) => (
              <div key={item.title} className="bg-surface border border-border rounded-2xl p-6">
                <item.icon className="w-6 h-6 text-emerald-400 mb-3" />
                <h3 className="text-lg font-semibold text-ink mb-2">{item.title}</h3>
                <p className="text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
