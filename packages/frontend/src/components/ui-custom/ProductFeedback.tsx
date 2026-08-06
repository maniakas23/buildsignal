import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StarRating } from "@/components/ui/star-rating";
import { toast } from "sonner";

export function ProductFeedback() {
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleSubmit = () => {
    if (!category || !feedback.trim() || rating === 0) {
      toast.error("Please fill in all fields");
      return;
    }

    toast.success("Thank you for your feedback!");
    setRating(0);
    setCategory("");
    setFeedback("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Rating</p>
            <StarRating value={rating} onChange={setRating} />
          </div>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
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
            placeholder="Tell us what you think..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
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

export default ProductFeedback;
