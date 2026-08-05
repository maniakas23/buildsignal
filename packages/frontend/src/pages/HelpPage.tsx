import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, Book, MessageCircle, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const faqs = [
  { question: "How does BuildSignal find opportunities?", answer: "BuildSignal uses AI to analyze building permit data from 500+ counties, detecting patterns and predicting where construction activity will surge." },
  { question: "What counties are covered?", answer: "We cover major metropolitan counties across the US. Check our County Coverage page for the full list." },
  { question: "How accurate are the predictions?", answer: "Our models achieve 85%+ accuracy on permit volume predictions, validated against historical data." },
  { question: "Can I export reports?", answer: "Yes, Pro and Enterprise plans include PDF, CSV, and Excel export capabilities." },
  { question: "Is there an API?", answer: "Yes, Pro and Enterprise plans include API access for integrating BuildSignal data into your own systems." },
];

export function HelpPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = search.trim() ? faqs.filter((f) => f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase())) : faqs;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Help Center</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search help articles..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:bg-accent/50" onClick={() => navigate("/onboarding")}>
          <CardContent className="p-6 text-center">
            <Book className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="font-medium">Getting Started</div>
            <div className="text-sm text-muted-foreground">Learn the basics</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-accent/50" onClick={() => navigate("/contact")}>
          <CardContent className="p-6 text-center">
            <MessageCircle className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="font-medium">Contact Support</div>
            <div className="text-sm text-muted-foreground">Get help from our team</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-accent/50" onClick={() => navigate("/pricing")}>
          <CardContent className="p-6 text-center">
            <ArrowRight className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="font-medium">Pricing</div>
            <div className="text-sm text-muted-foreground">Plans and billing</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Frequently Asked Questions</CardTitle></CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            {filtered.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No results found for &quot;{search}&quot;</p>}
        </CardContent>
      </Card>
    </div>
  );
}
