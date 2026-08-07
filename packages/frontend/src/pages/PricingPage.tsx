import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Building2,
  Shield,
  Lock,
  CreditCard,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  Users,
  Zap,
  HelpCircle,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  description: string;
  features: string[];
  highlighted: boolean;
  cta: string;
}

const allFeatures = [
  { key: "reports", label: "Intelligence Reports", icon: Zap },
  { key: "alerts", label: "Real-time Alerts", icon: Zap },
  { key: "counties", label: "County Coverage", icon: Users },
  { key: "watchlist", label: "Watchlist Items", icon: Users },
  { key: "api", label: "API Access", icon: Zap },
  { key: "sso", label: "SSO / SAML", icon: Shield },
  { key: "support", label: "Priority Support", icon: Users },
  { key: "analytics", label: "Advanced Analytics", icon: Zap },
  { key: "whiteglove", label: "White-glove Onboarding", icon: Users },
];

const faqs = [
  {
    question: "Can I change plans at any time?",
    answer:
      "Yes. You can upgrade or downgrade your plan at any time from your billing settings. Prorated charges or credits will apply.",
  },
  {
    question: "What's included in each plan?",
    answer:
      "Every plan includes core intelligence features. Higher tiers add more reports, alerts, API access, advanced analytics, and priority support. See the comparison table above for full details.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes. Every paid plan starts with a 14-day free trial. No credit card required to start. Cancel anytime during the trial and you won't be charged.",
  },
  {
    question: "How do I cancel?",
    answer:
      "You can cancel your subscription at any time from your Account → Billing page. Your access continues until the end of your current billing period.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "We offer a 14-day money-back guarantee. If you're not satisfied, contact support within 14 days of your first charge for a full refund.",
  },
];

function FeatureValue({
  plan,
  featureKey,
}: {
  plan: { features: string[]; name: string };
  featureKey: string;
}) {
  const hasFeature = plan.features.some(
    (f) =>
      f.toLowerCase().includes(featureKey) ||
      (featureKey === "reports" && f.toLowerCase().includes("report")) ||
      (featureKey === "alerts" && f.toLowerCase().includes("alert")) ||
      (featureKey === "counties" && f.toLowerCase().includes("count")) ||
      (featureKey === "watchlist" && f.toLowerCase().includes("watch")) ||
      (featureKey === "api" && f.toLowerCase().includes("api")) ||
      (featureKey === "sso" && f.toLowerCase().includes("sso")) ||
      (featureKey === "support" && f.toLowerCase().includes("support")) ||
      (featureKey === "analytics" && f.toLowerCase().includes("analytic")) ||
      (featureKey === "whiteglove" && f.toLowerCase().includes("onboard"))
  );

  if (hasFeature) {
    const matchingFeature = plan.features.find(
      (f) =>
        f.toLowerCase().includes(featureKey) ||
        (featureKey === "reports" && f.toLowerCase().includes("report")) ||
        (featureKey === "alerts" && f.toLowerCase().includes("alert")) ||
        (featureKey === "counties" && f.toLowerCase().includes("count")) ||
        (featureKey === "watchlist" && f.toLowerCase().includes("watch")) ||
        (featureKey === "api" && f.toLowerCase().includes("api")) ||
        (featureKey === "sso" && f.toLowerCase().includes("sso")) ||
        (featureKey === "support" && f.toLowerCase().includes("support")) ||
        (featureKey === "analytics" && f.toLowerCase().includes("analytic")) ||
        (featureKey === "whiteglove" && f.toLowerCase().includes("onboard"))
    );
    return (
      <div className="flex items-center justify-center gap-1">
        <Check className="h-4 w-4 text-green-500" />
        <span className="text-xs text-muted-foreground">
          {matchingFeature?.replace(/\d+\+?/g, "").trim() || ""}
        </span>
      </div>
    );
  }

  return <span className="text-muted-foreground text-sm">—</span>;
}

export function PricingPage() {
  const navigate = useNavigate();
  const config = trpc.billing.config.useQuery();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const plans = (config.data?.plans || []) as Plan[];

  const getAnnualPrice = (price: number) => {
    if (price === 0) return 0;
    return Math.round(price * 12 * 0.8);
  };

  const getPriceDisplay = (plan: { price: number; interval: string }) => {
    if (plan.price === 0) return { display: "Custom", sub: "" };
    if (billingCycle === "annual") {
      const annual = getAnnualPrice(plan.price);
      return {
        display: `$${Math.round(annual / 12)}`,
        sub: "/month billed annually",
      };
    }
    return { display: `$${plan.price}`, sub: `/${plan.interval}` };
  };

  const handleSelectPlan = (planId: string) => {
    navigate(`/signup?plan=${planId}&cycle=${billingCycle}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-16 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">
            <BadgeCheck className="h-3 w-3 mr-1" />
            14-Day Money-Back Guarantee
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your intelligence needs. All plans include a 14-day free trial.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <Tabs
            value={billingCycle}
            onValueChange={(v) => setBillingCycle(v as "monthly" | "annual")}
          >
            <TabsList className="bg-muted">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="annual" className="relative">
                Annual
                <Badge
                  variant="default"
                  className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] px-1.5 py-0"
                >
                  Save 20%
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {plans.map((plan) => {
            const priceInfo = getPriceDisplay(plan);
            const isHighlighted = plan.highlighted;

            return (
              <div
                key={plan.id}
                className={cn(
                  "relative p-6 border rounded-xl transition-all hover:shadow-lg",
                  isHighlighted
                    ? "border-primary ring-2 ring-primary scale-105 bg-card shadow-md"
                    : "border-border bg-card"
                )}
              >
                {isHighlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <h3 className="text-lg font-semibold mt-2">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{priceInfo.display}</span>
                  {priceInfo.sub && (
                    <span className="text-muted-foreground text-sm ml-1">
                      {priceInfo.sub}
                    </span>
                  )}
                </div>
                {billingCycle === "annual" && plan.price > 0 && (
                  <p className="text-xs text-green-600 font-medium mt-1">
                    ${getAnnualPrice(plan.price)} billed annually
                  </p>
                )}
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>

                <ul className="mt-4 space-y-2">
                  {plan.features.slice(0, 5).map((feature: string) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                  {plan.features.length > 5 && (
                    <li className="text-xs text-muted-foreground pl-6">
                      +{plan.features.length - 5} more features
                    </li>
                  )}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={cn(
                    "mt-6 w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                    isHighlighted
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  Start Free Trial
                </button>
              </div>
            );
          })}
        </div>

        {/* Not sure CTA */}
        <div className="text-center mb-10">
          <button
            onClick={() => navigate("/demo")}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            Not sure which plan?{" "}
            <span className="font-medium underline underline-offset-2">
              Talk to Sales
            </span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Trust Signals */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-16 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-green-500" />
            <span>SSL Secure</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-green-500" />
            <span>PCI Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-500" />
            <span>No hidden fees</span>
          </div>
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-green-500" />
            <span>14-Day Money-Back Guarantee</span>
          </div>
        </div>

        {/* Comparison Table */}
        {plans.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-8">Compare All Plans</h2>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left p-4 font-semibold">Feature</th>
                    {plans.map((plan) => (
                      <th
                        key={plan.id}
                        className={cn(
                          "p-4 text-center font-semibold",
                          plan.highlighted && "bg-primary/5 text-primary"
                        )}
                      >
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allFeatures.map((feature, idx) => (
                    <tr
                      key={feature.key}
                      className={cn(
                        "border-b border-border",
                        idx % 2 === 0 ? "bg-background" : "bg-muted/20"
                      )}
                    >
                      <td className="p-4 font-medium">
                        <div className="flex items-center gap-2">
                          <feature.icon className="h-4 w-4 text-muted-foreground" />
                          {feature.label}
                        </div>
                      </td>
                      {plans.map((plan) => (
                        <td
                          key={plan.id}
                          className={cn(
                            "p-4 text-center",
                            plan.highlighted && "bg-primary/5"
                          )}
                        >
                          <FeatureValue plan={plan} featureKey={feature.key} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-border rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium">{faq.question}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 text-muted-foreground text-sm">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Enterprise CTA */}
        <div className="bg-muted/30 rounded-xl p-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Building2 className="h-5 w-5" />
            <span className="font-medium">Need a custom solution?</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Contact our sales team for volume pricing, custom integrations, white-label reports, and dedicated support.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate("/demo")}
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Request a Demo
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-5 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
