import { useState, useCallback, useEffect } from "react";
import { trackEvent } from "@/hooks/usePageTracking";
import { Calculator, Clock, DollarSign, Users, Info } from "lucide-react";

interface ROICalculatorState {
  counties: number;
  hoursPerWeek: number;
  hourlyCost: number;
  teamSize: number;
  efficiencyAssumption: number;
}

const DEFAULT_STATE: ROICalculatorState = {
  counties: 5, hoursPerWeek: 10, hourlyCost: 75, teamSize: 1, efficiencyAssumption: 40,
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatHours(value: number): string {
  return `${Math.round(value)} hrs`;
}

export function ROICalculator() {
  const [state, setState] = useState<ROICalculatorState>(DEFAULT_STATE);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showFormula, setShowFormula] = useState(false);

  const updateField = useCallback((field: keyof ROICalculatorState, value: number) => {
    setState((prev) => ({ ...prev, [field]: value }));
    if (!hasInteracted) { setHasInteracted(true); trackEvent("roi_calculator_started", { field }); }
  }, [hasInteracted]);

  const weeklyTeamHours = state.hoursPerWeek * state.teamSize;
  const monthlyResearchHours = weeklyTeamHours * 4.33;
  const monthlyResearchCost = monthlyResearchHours * state.hourlyCost;
  const estimatedRecoveredHours = monthlyResearchHours * (state.efficiencyAssumption / 100);
  const estimatedOperationalValue = estimatedRecoveredHours * state.hourlyCost;
  const weeklyHoursPerCounty = state.hoursPerWeek / Math.max(state.counties, 1);

  useEffect(() => {
    if (hasInteracted) {
      const timeout = setTimeout(() => {
        trackEvent("roi_calculator_completed", { counties: state.counties, hoursPerWeek: state.hoursPerWeek, hourlyCost: state.hourlyCost, teamSize: state.teamSize, efficiencyAssumption: state.efficiencyAssumption });
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [state, hasInteracted]);

  return (
    <section id="roi-calculator" className="py-20 md:py-28 bg-canvas" aria-labelledby="roi-heading">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-4">
            <Calculator className="w-4 h-4" /><span>Operational Value</span>
          </div>
          <h2 id="roi-heading" className="text-3xl md:text-4xl font-bold text-ink mb-4">Estimate Your Research Time</h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">See how much manual research effort BuildSignal could help you redirect toward decisions. All figures are estimates based on your inputs.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="bg-surface border border-border rounded-2xl p-6 md:p-8">
            <h3 className="text-lg font-semibold text-ink mb-6">Your Research Profile</h3>
            <div className="space-y-6">
              {[
                { id: "counties", label: "Counties monitored", sub: "(markets you track)", icon: null, min: 1, max: 50, step: 1, val: state.counties, fmt: (v: number) => `${v}` },
                { id: "hours", label: "Research hours per week", sub: null, icon: Clock, min: 1, max: 40, step: 1, val: state.hoursPerWeek, fmt: (v: number) => `${v}` },
                { id: "cost", label: "Approximate hourly research cost", sub: null, icon: DollarSign, min: 25, max: 250, step: 5, val: state.hourlyCost, fmt: (v: number) => `$${v}` },
                { id: "team", label: "Team members researching", sub: "(optional)", icon: Users, min: 1, max: 10, step: 1, val: state.teamSize, fmt: (v: number) => `${v}` },
              ].map((field) => (
                <div key={field.id}>
                  <label htmlFor={field.id} className="flex items-center gap-2 text-sm font-medium text-ink mb-2">
                    {field.icon && <field.icon className="w-4 h-4 text-muted" />}
                    <span>{field.label}</span>
                    {field.sub && <span className="text-xs text-muted">{field.sub}</span>}
                  </label>
                  <div className="flex items-center gap-4">
                    <input id={field.id} type="range" min={field.min} max={field.max} step={field.step} value={field.val}
                      onChange={(e) => updateField(field.id as keyof ROICalculatorState, Number(e.target.value))}
                      className="flex-1 h-2 bg-border rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                    <span className="min-w-[4rem] text-right font-mono text-emerald-400 font-semibold">{field.fmt(field.val)}</span>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-border">
                <label htmlFor="efficiency" className="flex items-center gap-2 text-sm font-medium text-ink mb-2">
                  <span>Assumed efficiency gain</span>
                  <button type="button" onClick={() => setShowFormula(!showFormula)} className="text-muted hover:text-ink transition-colors" aria-label="Toggle formula explanation">
                    <Info className="w-4 h-4" />
                  </button>
                </label>
                <div className="flex items-center gap-4">
                  <input id="efficiency" type="range" min={10} max={80} step={5} value={state.efficiencyAssumption}
                    onChange={(e) => { updateField("efficiencyAssumption", Number(e.target.value)); trackEvent("roi_assumption_changed", { value: Number(e.target.value) }); }}
                    className="flex-1 h-2 bg-border rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                  <span className="min-w-[3.5rem] text-right font-mono text-emerald-400 font-semibold">{state.efficiencyAssumption}%</span>
                </div>
                <p className="text-xs text-muted mt-2">This is an illustrative assumption, not a verified BuildSignal performance statistic. Adjust based on your own expectations.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-2xl p-6 md:p-8">
              <h3 className="text-lg font-semibold text-ink mb-6">Estimated Impact <span className="text-sm font-normal text-muted">(not guaranteed)</span></h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-canvas rounded-xl p-4 border border-border">
                  <p className="text-sm text-muted mb-1">Monthly research hours</p>
                  <p className="text-2xl font-bold text-ink font-mono">{formatHours(monthlyResearchHours)}</p>
                  <p className="text-xs text-muted mt-1">{state.hoursPerWeek} hrs/wk × {state.teamSize} researcher{state.teamSize > 1 ? "s" : ""}</p>
                </div>
                <div className="bg-canvas rounded-xl p-4 border border-border">
                  <p className="text-sm text-muted mb-1">Monthly research cost (est.)</p>
                  <p className="text-2xl font-bold text-ink font-mono">{formatCurrency(monthlyResearchCost)}</p>
                  <p className="text-xs text-muted mt-1">Based on hourly rate × hours</p>
                </div>
                <div className="bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/20">
                  <p className="text-sm text-emerald-400 mb-1">Time potentially recovered</p>
                  <p className="text-2xl font-bold text-emerald-400 font-mono">{formatHours(estimatedRecoveredHours)}</p>
                  <p className="text-xs text-emerald-400/70 mt-1">{state.efficiencyAssumption}% of monthly hours</p>
                </div>
                <div className="bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/20">
                  <p className="text-sm text-emerald-400 mb-1">Cost potentially redirected</p>
                  <p className="text-2xl font-bold text-emerald-400 font-mono">{formatCurrency(estimatedOperationalValue)}</p>
                  <p className="text-xs text-emerald-400/70 mt-1">Estimated operational value</p>
                </div>
              </div>
              <div className="mt-4 bg-canvas rounded-xl p-4 border border-border">
                <p className="text-sm text-muted mb-1">Hours per county per week</p>
                <p className="text-xl font-bold text-ink font-mono">{weeklyHoursPerCounty.toFixed(1)} hrs</p>
                <p className="text-xs text-muted mt-1">Spreading {state.hoursPerWeek} hours across {state.counties} counties</p>
              </div>
            </div>

            {showFormula && (
              <div className="bg-surface border border-border rounded-2xl p-6">
                <h4 className="text-sm font-semibold text-ink mb-3">How these estimates work</h4>
                <div className="space-y-2 text-sm text-muted font-mono">
                  <p>weeklyTeamHours = hoursPerWeek × teamSize</p>
                  <p>monthlyResearchHours = weeklyTeamHours × 4.33</p>
                  <p>monthlyResearchCost = monthlyResearchHours × hourlyCost</p>
                  <p>recoveredHours = monthlyResearchHours × (efficiencyRate / 100)</p>
                  <p>operationalValue = recoveredHours × hourlyCost</p>
                </div>
                <p className="text-xs text-muted mt-3">These are simple arithmetic estimates. BuildSignal does not guarantee any specific time savings or cost reduction. Actual results depend on workflow, data coverage, and individual usage patterns.</p>
              </div>
            )}

            <div className="text-center">
              <a href="/signup" className="inline-flex items-center justify-center px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
                onClick={() => trackEvent("signup_clicked", { source: "roi_calculator" })}>
                Start Your 14-Day Free Trial
              </a>
              <p className="text-sm text-muted mt-2">No credit card required. Cancel anytime.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
