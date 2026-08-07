import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Download,
  Calendar,
  CheckCircle,
  AlertCircle,
  Mail,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Building2,
  Sun,
  Home,
} from "lucide-react";
import { SocialShare } from "@/components/marketing/SocialShare";

interface Report {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  category: string;
  readTime: string;
  icon: React.ElementType;
}

const featuredReports: Report[] = [
  {
    id: "q3-2026-commercial",
    title: "Q3 2026: Top 10 Counties for Commercial Development",
    date: "June 15, 2026",
    excerpt:
      "An in-depth analysis of the counties seeing the fastest commercial permit growth. We break down office, retail, and industrial trends with 6-month forward projections.",
    category: "Commercial",
    readTime: "8 min read",
    icon: Building2,
  },
  {
    id: "solar-texas",
    title: "The Solar Permits Surge: What's Driving Growth in Texas",
    date: "June 12, 2026",
    excerpt:
      "Texas solar permit filings are up 340% year-over-year. We analyze the policy drivers, utility incentives, and which counties are leading the charge.",
    category: "Energy",
    readTime: "6 min read",
    icon: Sun,
  },
  {
    id: "housing-outlook",
    title: "Housing Market Predictions: 6-Month Outlook",
    date: "June 8, 2026",
    excerpt:
      "Our AI models forecast housing permit trends through Q4 2026. Key findings: suburban migration continues, multifamily cooling in select metros.",
    category: "Residential",
    readTime: "10 min read",
    icon: Home,
  },
];

export function ReportsHubPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (value: string): boolean => {
    if (!value.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Please enter a valid email address");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate(email)) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setEmail("");
    }, 800);
  };

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://buildsignal.net";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center space-y-6">
          <Badge variant="secondary" className="text-sm px-4 py-1.5 rounded-full">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Weekly Infrastructure Intelligence
          </Badge>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
            Infrastructure Intelligence{" "}
            <span className="text-primary">Reports</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Weekly insights on construction trends, permit surges, and market
            opportunities. Data-driven analysis for professionals who move fast.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>Data-driven analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>Published every Tuesday</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span>Free to read, downloadable PDFs</span>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Featured Reports */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <Badge variant="outline" className="text-xs uppercase tracking-wider">
              Featured Reports
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              This Week&apos;s Top Insights
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Hand-picked reports from our analysts covering the most important
              trends in construction and development.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredReports.map((report) => (
              <Card
                key={report.id}
                className="hover:shadow-lg transition-shadow flex flex-col group"
              >
                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <report.icon className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {report.category}
                    </Badge>
                  </div>

                  <div className="space-y-3 flex-1">
                    <h3 className="font-semibold text-lg leading-snug group-hover:text-primary transition-colors">
                      {report.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {report.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {report.readTime}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {report.excerpt}
                    </p>
                  </div>

                  <div className="pt-5 mt-4 border-t space-y-3">
                    <div className="flex items-center justify-between">
                      <Button
                        variant="default"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => navigate(`/reports-hub/${report.id}`)}
                      >
                        Read Full Report
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-primary/10"
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Share this report
                      </span>
                      <SocialShare
                        url={`${baseUrl}/reports-hub/${report.id}`}
                        title={report.title}
                        description={report.excerpt}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* Subscribe Section */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="space-y-2">
              <Badge variant="outline" className="text-xs uppercase tracking-wider">
                Newsletter
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight">
                Subscribe to Weekly Reports
              </h2>
              <p className="text-muted-foreground">
                Get every new report delivered to your inbox. No spam, unsubscribe
                anytime.
              </p>
            </div>

            <Card className="border-primary/20">
              <CardContent className="p-6">
                {submitted ? (
                  <div className="flex items-center justify-center gap-3 py-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div className="text-left">
                      <p className="font-medium">You&apos;re subscribed!</p>
                      <p className="text-sm text-muted-foreground">
                        Watch your inbox for the next report.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubscribe}
                    className="flex flex-col sm:flex-row gap-3"
                  >
                    <div className="flex-1">
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError("");
                        }}
                        aria-invalid={!!error}
                        className="h-11"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-11 gap-2 shrink-0"
                    >
                      {isSubmitting ? (
                        <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Mail className="h-4 w-4" />
                          Subscribe
                        </>
                      )}
                    </Button>
                  </form>
                )}
                {error && !submitted && (
                  <p className="text-xs text-destructive flex items-center justify-center gap-1 mt-3">
                    <AlertCircle className="h-3 w-3" />
                    {error}
                  </p>
                )}
                {!submitted && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Join 5,000+ professionals receiving weekly infrastructure
                    intelligence. No spam, unsubscribe anytime.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Ready for Real-Time Intelligence?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Reports are just the beginning. Get live permit data, AI predictions,
            and automated alerts with a BuildSignal subscription.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" onClick={() => navigate("/signup")} className="gap-2">
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/demo")}
            >
              Request a Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
