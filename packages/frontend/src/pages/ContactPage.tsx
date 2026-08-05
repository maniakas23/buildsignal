import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Contact Us</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Get in Touch</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-primary"/><span>support@buildsignal.net</span></div>
            <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-primary"/><span>+1 (555) 123-4567</span></div>
            <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-primary"/><span>San Francisco, CA</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Send a Message</CardTitle></CardHeader>
          <CardContent>
            {submitted ? (
              <div className="text-center py-8">
                <Send className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="font-medium">Message sent!</p>
                <p className="text-sm text-muted-foreground">We will get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2"><Label>Name</Label><Input required placeholder="Your name"/></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" required placeholder="your@email.com"/></div>
                <div className="space-y-2"><Label>Message</Label><Textarea required placeholder="How can we help?" rows={4}/></div>
                <Button type="submit" className="w-full gap-2"><Send className="h-4 w-4"/>Send Message</Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
