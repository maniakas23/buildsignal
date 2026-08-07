import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Users,
  Target,
  Shield,
  Sparkles,
  ArrowRight,
  Building2,
  Mail,
  Phone,
  Briefcase,
  MessageSquare,
} from "lucide-react";

interface FormData {
  name: string;
  email: string;
  company: string;
  phone: string;
  teamSize: string;
  preferredDate: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  company?: string;
  teamSize?: string;
  preferredDate?: string;
}

export function DemoRequestPage() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    company: "",
    phone: "",
    teamSize: "",
    preferredDate: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.company.trim()) newErrors.company = "Company is required";
    if (!formData.teamSize) newErrors.teamSize = "Team size is required";
    if (!formData.preferredDate) newErrors.preferredDate = "Preferred date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

  const trustBadges = [
    { icon: Shield, text: "No commitment required" },
    { icon: Target, text: "Personalized to your market" },
    { icon: Clock, text: "We'll reach out within 24 hours" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-16 px-4 max-w-4xl">
        {/* Hero */}
        <div className="text-center space-y-4 mb-12">
          <Badge variant="secondary" className="text-sm px-4 py-1.5 rounded-full">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Live Customer Launch
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            See BuildSignal in Action
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Schedule a 15-minute personalized demo with our team. We&apos;ll show
            you how to find opportunities before your competitors.
          </p>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {trustBadges.map((badge) => (
              <div
                key={badge.text}
                className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-full px-4 py-2"
              >
                <badge.icon className="h-4 w-4 text-primary" />
                <span>{badge.text}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator className="mb-10" />

        {submitted ? (
          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="p-10 text-center space-y-6">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Demo Requested!</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Thanks for your interest. Our team will reach out within 24
                  hours to confirm your demo time.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button onClick={() => navigate("/")} className="gap-2">
                  Back to Home
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => navigate("/pricing")}>
                  View Pricing
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 md:grid-cols-5">
            {/* Form */}
            <Card className="md:col-span-3">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Name <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Your full name"
                          className="pl-9"
                          aria-invalid={!!errors.name}
                        />
                      </div>
                      {errors.name && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="you@company.com"
                          className="pl-9"
                          aria-invalid={!!errors.email}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="company">
                        Company <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          placeholder="Your company name"
                          className="pl-9"
                          aria-invalid={!!errors.company}
                        />
                      </div>
                      {errors.company && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.company}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone (optional)</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+1 (555) 000-0000"
                          className="pl-9"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="teamSize">
                        Team Size <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.teamSize}
                        onValueChange={(value) =>
                          handleSelectChange("teamSize", value)
                        }
                      >
                        <SelectTrigger
                          id="teamSize"
                          aria-invalid={!!errors.teamSize}
                        >
                          <SelectValue placeholder="Select team size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Just me</SelectItem>
                          <SelectItem value="2-10">2–10 people</SelectItem>
                          <SelectItem value="11-50">11–50 people</SelectItem>
                          <SelectItem value="50+">50+ people</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.teamSize && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.teamSize}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="preferredDate">
                        Preferred Date{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="preferredDate"
                          name="preferredDate"
                          type="date"
                          value={formData.preferredDate}
                          onChange={handleChange}
                          className="pl-9"
                          aria-invalid={!!errors.preferredDate}
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                      {errors.preferredDate && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.preferredDate}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">
                      Message (optional)
                    </Label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us about your use case, the markets you care about, or any questions you have..."
                        rows={4}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full gap-2"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Scheduling...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Request Demo
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Sidebar Info */}
            <div className="md:col-span-2 space-y-4">
              <Card className="bg-primary/5 border-primary/10">
                <CardContent className="p-5 space-y-4">
                  <h3 className="font-semibold">What to Expect</h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>
                        A 15-minute walkthrough tailored to your market and use
                        case
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>
                        Live Q&A with our product specialists
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>
                        Custom pricing discussion for your team size
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>
                        No commitment required — see the platform first
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5 space-y-3">
                  <h3 className="font-semibold text-sm">Trusted By</h3>
                  <div className="flex flex-wrap gap-2">
                    {["Summit Development", "Atlas Capital", "Park & Associates", "Northridge Engineering"].map(
                      (company) => (
                        <Badge
                          key={company}
                          variant="secondary"
                          className="text-xs font-normal"
                        >
                          <Building2 className="h-3 w-3 mr-1" />
                          {company}
                        </Badge>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
