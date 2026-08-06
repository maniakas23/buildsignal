import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function BetaFeedback() {
  const [type, setType] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (!type || !message.trim()) {
      toast.error("Please select a type and enter a message");
      return;
    }

    toast.success("Feedback submitted");
    setType("");
    setMessage("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="Select feedback type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="feature">Feature Request</SelectItem>
              <SelectItem value="bug">Bug Report</SelectItem>
              <SelectItem value="ux">UX Feedback</SelectItem>
              <SelectItem value="billing">Billing Question</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Textarea
            placeholder="Describe your feedback..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />

          <Button onClick={handleSubmit} className="w-full">
            Submit Feedback
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default BetaFeedback;
