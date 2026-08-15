import { Database, Shield, Activity, BarChart3 } from "lucide-react";

const credibilityItems = [
  { icon: Database, title: "Public-Source Intelligence", description: "Growth signals derived from public infrastructure and development activity." },
  { icon: Shield, title: "Provenance-Aware", description: "Production intelligence maintains source and provenance boundaries." },
  { icon: Activity, title: "Continuous Monitoring", description: "BuildSignal monitors supported markets for new development activity." },
  { icon: BarChart3, title: "Confidence Scoring", description: "Signals include confidence and evidence indicators where available." },
];

export function CredibilityBar() {
  return (
    <section className="py-12 bg-surface border-y border-border" aria-label="Platform capabilities">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {credibilityItems.map((item) => (
            <div key={item.title} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink mb-1">{item.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
