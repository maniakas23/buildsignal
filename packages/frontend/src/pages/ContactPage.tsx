import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  MapPin,
  Phone,
  Send,
  MessageSquare,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Globe,
  ArrowRight,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Footer } from "@/components/ui-custom/Footer";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export function ContactPage() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
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
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Contact Us</h1>
        <p className="text-muted-foreground">
          We&apos;re here to help. Choose the best way to reach us below.
        </p>
      </div>

      {/* Contact Methods */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:bg-accent/30 transition-colors">
          <CardContent className="p-6 text-center space-y-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-medium">Email</div>
              <div className="text-sm text-muted-foreground">
                support@buildsignal.net
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              Fastest Response
            </Badge>
          </CardContent>
        </Card>

        <Card className="hover:bg-accent/30 transition-colors">
          <CardContent className="p-6 text-center space-y-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-medium">Live Chat</div>
              <div className="text-sm text-muted-foreground">
                Chat with our team in real time
              </div>
            </div>
            <Button variant="outline" size="sm" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card
          className="hover:bg-accent/30 transition-colors cursor-pointer"
          onClick={() => navigate("/contact?demo=true")}
        >
          <CardContent className="p-6 text-center space-y-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-medium">Schedule a Demo</div>
              <div className="text-sm text-muted-foreground">
                Book a personalized walkthrough
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-1">
              Book Now <ArrowRight className="h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Response Time Banner */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-sm bg-muted/50 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-green-500" />
          <span>
            <span className="font-medium">Typical response:</span> Within 4
            hours
          </span>
        </div>
        <Separator orientation="vertical" className="h-4 hidden md:block" />
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span>
            <span className="font-medium">Business hours:</span> Monday–
            Friday, 9AM–6PM ET
          </span>
        </div>
        <Separator orientation="vertical" className="h-4 hidden md:block" />
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <span>
            <span className="font-medium">Coverage:</span> US & Canada
          </span>
        </div>
      </div>

      {/* Main Content: Form + Location */}
      <div className="grid gap-6 md:grid-cols-5">
        {/* Contact Form */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Send a Message</CardTitle>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-lg">Message sent!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Thanks for reaching out. We&apos;ll get back to you within 4
                    hours during business hours.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      name: "",
                      email: "",
                      subject: "",
                      message: "",
                    });
                  }}
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      aria-invalid={!!errors.name}
                    />
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
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@company.com"
                      aria-invalid={!!errors.email}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">
                    Subject <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    aria-invalid={!!errors.subject}
                  />
                  {errors.subject && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.subject}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">
                    Message <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your question or issue..."
                    rows={5}
                    aria-invalid={!!errors.message}
                  />
                  {errors.message && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Location & Info Card */}
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Our Office</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Map Placeholder */}
              <div className="relative w-full h-40 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 opacity-20">
                  <svg viewBox="0 0 400 200" className="w-full h-full">
                    <rect width="400" height="200" fill="currentColor" className="text-muted-foreground" />
                    <path d="M0 100 Q100 80 200 100 T400 100" stroke="currentColor" strokeWidth="2" fill="none" className="text-primary" opacity="0.5" />
                    <path d="M0 120 Q100 100 200 120 T400 120" stroke="currentColor" strokeWidth="1" fill="none" className="text-primary" opacity="0.3" />
                    <path d="M0 80 Q100 60 200 80 T400 80" stroke="currentColor" strokeWidth="1" fill="none" className="text-primary" opacity="0.3" />
                    <circle cx="200" cy="100" r="6" className="fill-primary" />
                    <circle cx="200" cy="100" r="12" className="stroke-primary" strokeWidth="2" fill="none" opacity="0.4" />
                  </svg>
                </div>
                <div className="relative z-10 text-center">
                  <MapPin className="h-6 w-6 text-primary mx-auto mb-1" />
                  <span className="text-sm font-medium">San Francisco, CA</span>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Building2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium">BuildSignal HQ</div>
                    <div className="text-muted-foreground">
                      San Francisco, California
                      <br />
                      United States
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-primary shrink-0" />
                  <span>support@buildsignal.net</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium">Business Hours</div>
                    <div className="text-muted-foreground">
                      Monday – Friday
                      <br />
                      9:00 AM – 6:00 PM ET
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => navigate("/help")}
              >
                <MessageSquare className="h-4 w-4" />
                Help Center
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => navigate("/pricing")}
              >
                <Building2 className="h-4 w-4" />
                Pricing & Plans
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => navigate("/security")}
              >
                <Shield className="h-4 w-4" />
                Security
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
