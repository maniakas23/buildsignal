import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Book,
  MessageCircle,
  ArrowRight,
  Zap,
  CreditCard,
  Database,
  Code,
  User,
  Shield,
  FileText,
  Clock,
  Mail,
  Calendar,
  HelpCircle,
  TrendingUp,
  Download,
  AlertTriangle,
  Ticket,
  Plus,
  Hash,
  CheckCircle2,
  List,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Footer } from "@/components/ui-custom/Footer";

type Category =
  | "Getting Started"
  | "Billing"
  | "Data & Accuracy"
  | "API"
  | "Account";

interface FaqItem {
  question: string;
  answer: string;
  category: Category;
  popular?: boolean;
}

const faqs: FaqItem[] = [
  {
    question: "How do I get started with BuildSignal?",
    answer:
      "After signing up, complete your profile, add counties to your watchlist, and set up alert preferences. You can then generate your first intelligence report from the Dashboard. Our onboarding checklist guides you through each step.",
    category: "Getting Started",
    popular: true,
  },
  {
    question: "What data sources does BuildSignal use?",
    answer:
      "BuildSignal aggregates building permit data from 500+ counties across the US, plus zoning changes, contractor licenses, and demographic indicators. We update our dataset daily and validate against official county records.",
    category: "Data & Accuracy",
    popular: true,
  },
  {
    question: "How accurate are the predictions?",
    answer:
      "Our AI models achieve 85%+ accuracy on permit volume predictions, validated against 3+ years of historical data. Accuracy varies by county density and data completeness. Each prediction includes a confidence score so you can assess reliability.",
    category: "Data & Accuracy",
    popular: true,
  },
  {
    question: "What counties are covered?",
    answer:
      "We cover major metropolitan counties across all 50 US states, with particular depth in high-growth markets. Visit our County Coverage page for the full, searchable list of supported counties and their data freshness.",
    category: "Data & Accuracy",
  },
  {
    question: "How does billing work?",
    answer:
      "BuildSignal bills monthly or annually depending on your selected plan. You can upgrade, downgrade, or cancel at any time from your Billing page. Annual plans include a 20% discount. All charges are prorated.",
    category: "Billing",
    popular: true,
  },
  {
    question: "How do I cancel my subscription?",
    answer:
      "You can cancel anytime from Account → Billing. Your access continues until the end of your current billing period. We also offer a 14-day money-back guarantee for new subscriptions.",
    category: "Billing",
  },
  {
    question: "Is there an API?",
    answer:
      "Yes. Pro and Enterprise plans include full REST API access for integrating BuildSignal data into your CRM, BI tools, or internal systems. API documentation is available in your account settings. Rate limits vary by plan tier.",
    category: "API",
    popular: true,
  },
  {
    question: "How do I export reports?",
    answer:
      "Pro and Enterprise plans support PDF, CSV, and Excel exports. From any report or dashboard, click the Export button in the top-right corner. You can also schedule automated exports via the API.",
    category: "API",
  },
  {
    question: "What integrations are supported?",
    answer:
      "BuildSignal integrates with Salesforce, HubSpot, Slack, Microsoft Teams, and Zapier. Enterprise customers can request custom integrations. Visit Settings → Integrations to connect your tools.",
    category: "API",
  },
  {
    question: "How secure is my data?",
    answer:
      "BuildSignal uses TLS 1.3 encryption in transit and AES-256 at rest. We are SOC 2 Type II certified and undergo annual third-party penetration testing. We never sell your data. Read our full Security page for details.",
    category: "Account",
    popular: true,
  },
  {
    question: "How do I update my account information?",
    answer:
      "Go to Settings → Profile to update your name, email, company, and notification preferences. For billing address or payment method changes, visit Settings → Billing.",
    category: "Account",
  },
  {
    question: "How do I contact support?",
    answer:
      "Email us at support@buildsignal.net, use the contact form on our Contact page, or schedule a demo call. We typically respond within 4 hours during business hours (Monday–Friday, 9AM–6PM ET).",
    category: "Account",
  },
];

const popularArticles = [
  {
    title: "Getting Started Guide",
    description: "Learn the basics of BuildSignal in 5 minutes",
    icon: Book,
    path: "/onboarding",
    badge: "Beginner",
  },
  {
    title: "Understanding Predictions",
    description: "How our AI models forecast construction activity",
    icon: TrendingUp,
    path: "/help",
    badge: "Data",
  },
  {
    title: "API Quick Start",
    description: "Integrate BuildSignal data into your systems",
    icon: Code,
    path: "/help",
    badge: "Developer",
  },
  {
    title: "Exporting Reports",
    description: "PDF, CSV, and Excel export options explained",
    icon: Download,
    path: "/help",
    badge: "Pro",
  },
  {
    title: "Security Overview",
    description: "How we protect your data and ensure compliance",
    icon: Shield,
    path: "/security",
    badge: "Trust",
  },
  {
    title: "Billing FAQ",
    description: "Plans, proration, refunds, and invoicing",
    icon: CreditCard,
    path: "/help",
    badge: "Billing",
  },
];

const categoryIcons: Record<Category, React.ElementType> = {
  "Getting Started": Zap,
  Billing: CreditCard,
  "Data & Accuracy": Database,
  API: Code,
  Account: User,
};

export function HelpPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<Category | "all">("all");

  // Ticket form state
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    category: "",
    description: "",
    priority: "Medium",
  });

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.subject.trim() || !ticketForm.description.trim()) return;
    const id = `TKT-${Math.floor(10000 + Math.random() * 90000)}`;
    setTicketId(id);
    setTicketSubmitted(true);
  };

  const filteredFaqs = useMemo(() => {
    let result = faqs;
    if (activeTab !== "all") {
      result = result.filter((f) => f.category === activeTab);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (f) =>
          f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q)
      );
    }
    return result;
  }, [search, activeTab]);

  const categories: (Category | "all")[] = [
    "all",
    "Getting Started",
    "Billing",
    "Data & Accuracy",
    "API",
    "Account",
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Help Center</h1>
        <p className="text-muted-foreground">
          Find answers, learn best practices, and get the most out of
          BuildSignal.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-xl mx-auto">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search help articles, FAQs, and guides..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 py-6 text-base"
        />
      </div>

      {/* Quick Action Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => navigate("/onboarding")}
        >
          <CardContent className="p-6 text-center">
            <Book className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="font-medium">Getting Started</div>
            <div className="text-sm text-muted-foreground">
              Learn the basics
            </div>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => navigate("/contact")}
        >
          <CardContent className="p-6 text-center">
            <MessageCircle className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="font-medium">Contact Support</div>
            <div className="text-sm text-muted-foreground">
              Get help from our team
            </div>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => navigate("/pricing")}
        >
          <CardContent className="p-6 text-center">
            <ArrowRight className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="font-medium">Pricing</div>
            <div className="text-sm text-muted-foreground">
              Plans and billing
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Articles */}
      {!search.trim() && activeTab === "all" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Popular Articles</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {popularArticles.map((article) => (
              <Card
                key={article.title}
                className="cursor-pointer hover:bg-accent/50 transition-colors group"
                onClick={() => navigate(article.path)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <article.icon className="h-5 w-5 text-primary" />
                    <Badge variant="secondary" className="text-xs">
                      {article.badge}
                    </Badge>
                  </div>
                  <div className="font-medium group-hover:text-primary transition-colors">
                    {article.title}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {article.description}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* FAQ Section with Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as Category | "all")}
        >
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50">
            {categories.map((cat) => {
              const Icon = cat === "all" ? FileText : categoryIcons[cat];
              return (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  className="flex items-center gap-1.5 text-xs md:text-sm"
                >
                  <Icon className="h-3.5 w-3.5 hidden sm:inline" />
                  {cat === "all" ? "All FAQs" : cat}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {categories.map((cat) => (
            <TabsContent key={cat} value={cat} className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {cat === "all" ? "All Questions" : `${cat} FAQs`}
                    <Badge variant="secondary" className="ml-2">
                      {filteredFaqs.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredFaqs.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                      {filteredFaqs.map((faq, i) => (
                        <AccordionItem
                          key={`${cat}-${i}`}
                          value={`item-${cat}-${i}`}
                        >
                          <AccordionTrigger className="text-left text-sm">
                            <span className="flex items-center gap-2">
                              {faq.popular && (
                                <Badge
                                  variant="default"
                                  className="text-[10px] px-1.5 py-0 shrink-0"
                                >
                                  Popular
                                </Badge>
                              )}
                              {faq.question}
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No results found for &quot;{search}&quot;
                      </p>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => {
                          setSearch("");
                          setActiveTab("all");
                        }}
                      >
                        Clear search
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Submit a Ticket */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Ticket className="h-4 w-4 text-primary" />
            Submit a Ticket
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ticketSubmitted ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto" />
              <p className="font-medium">Ticket submitted successfully!</p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Hash className="h-3.5 w-3.5" />
                Your ticket ID: <Badge variant="secondary">{ticketId}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                We&apos;ll respond within 4 hours during business hours.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTicketSubmitted(false);
                  setTicketId("");
                  setTicketForm({
                    subject: "",
                    category: "",
                    description: "",
                    priority: "Medium",
                  });
                }}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Submit Another Ticket
              </Button>
            </div>
          ) : (
            <form onSubmit={handleTicketSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ticket-subject">Subject</Label>
                  <Input
                    id="ticket-subject"
                    placeholder="Brief description of your issue"
                    value={ticketForm.subject}
                    onChange={(e) =>
                      setTicketForm((prev) => ({ ...prev, subject: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ticket-category">Category</Label>
                  <Select
                    value={ticketForm.category}
                    onValueChange={(value) =>
                      setTicketForm((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger id="ticket-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="getting-started">Getting Started</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="data">Data & Accuracy</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="account">Account</SelectItem>
                      <SelectItem value="bug">Bug Report</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticket-priority">Priority</Label>
                <div className="flex gap-2">
                  {(["Low", "Medium", "High"] as const).map((p) => (
                    <Button
                      key={p}
                      type="button"
                      variant={ticketForm.priority === p ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        setTicketForm((prev) => ({ ...prev, priority: p }))
                      }
                    >
                      {p}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticket-description">Description</Label>
                <Textarea
                  id="ticket-description"
                  placeholder="Please provide as much detail as possible..."
                  rows={4}
                  value={ticketForm.description}
                  onChange={(e) =>
                    setTicketForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  required
                />
              </div>
              <Button type="submit" className="gap-2">
                <Ticket className="h-4 w-4" />
                Submit Ticket
              </Button>
            </form>
          )}

          {/* Existing Tickets (Mock) */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center gap-2 mb-3">
              <List className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">Your Recent Tickets</h4>
            </div>
            <div className="space-y-2">
              {[
                { id: "TKT-87234", subject: "API rate limit questions", status: "Resolved", date: "Jan 10, 2025" },
                { id: "TKT-86521", subject: "Watchlist export issue", status: "In Progress", date: "Jan 5, 2025" },
              ].map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-mono text-xs text-muted-foreground">
                      {ticket.id}
                    </span>
                    <span>{ticket.subject}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={ticket.status === "Resolved" ? "outline" : "secondary"}
                      className="text-[10px]"
                    >
                      {ticket.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {ticket.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Still Need Help */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <MessageCircle className="h-10 w-10 text-primary mx-auto" />
            <h3 className="text-xl font-semibold">Still need help?</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Our support team is here to help you get the most out of
              BuildSignal. Reach out and we&apos;ll respond within 4 hours during
              business hours.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                onClick={() => navigate("/contact")}
                className="gap-2"
              >
                <Mail className="h-4 w-4" />
                Contact Support
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/contact")}
                className="gap-2"
              >
                <Calendar className="h-4 w-4" />
                Schedule a Demo
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground pt-2">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                support@buildsignal.net
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Mon–Fri, 9AM–6PM ET
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Footer />
    </div>
  );
}
