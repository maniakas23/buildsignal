import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, CheckCircle, AlertCircle, Sparkles, Users } from "lucide-react";

export function NewsletterSignup() {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate(email)) return;
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setEmail("");
    }, 800);
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-bold">
                Get Weekly Infrastructure Intelligence
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Free reports on construction trends, permit surges, and market
              opportunities delivered to your inbox every week.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>Join 5,000+ professionals. No spam, unsubscribe anytime.</span>
            </div>
          </div>

          <div className="w-full md:w-auto md:min-w-[320px]">
            {submitted ? (
              <div className="flex items-center gap-3 bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">
                    You&apos;re subscribed!
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500">
                    Watch your inbox for the next report.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                      }}
                      aria-invalid={!!error}
                      className="bg-background"
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="shrink-0">
                    {isSubmitting ? (
                      <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-1.5" />
                        Subscribe
                      </>
                    )}
                  </Button>
                </div>
                {error && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {error}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
