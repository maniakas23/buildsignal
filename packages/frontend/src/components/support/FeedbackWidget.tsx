import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, X, Star, CheckCircle2 } from "lucide-react";

interface FeedbackForm {
  rating: number;
  category: string;
  message: string;
}

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [form, setForm] = useState<FeedbackForm>({
    rating: 0,
    category: "",
    message: "",
  });

  const handleSubmit = () => {
    if (form.rating === 0 || !form.category || !form.message.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
      setSubmitted(false);
      setForm({ rating: 0, category: "", message: "" });
    }, 2000);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setSubmitted(false);
    setForm({ rating: 0, category: "", message: "" });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <Card className="w-80 shadow-2xl border animate-in slide-in-from-bottom-2 fade-in duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {submitted ? "Thank You!" : "How's your experience?"}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 -mr-2"
                onClick={handleCancel}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {submitted ? (
              <div className="text-center py-4 space-y-3">
                <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Your feedback helps us improve BuildSignal.
                </p>
              </div>
            ) : (
              <>
                {/* Star Rating */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rate your experience</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="p-0.5 transition-colors"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setForm((prev) => ({ ...prev, rating: star }))}
                      >
                        <Star
                          className={`h-6 w-6 transition-colors ${
                            star <= (hoverRating || form.rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/40"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={form.category}
                    onValueChange={(value) =>
                      setForm((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bug">Bug Report</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="general">General Feedback</SelectItem>
                      <SelectItem value="question">Question</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    placeholder="Tell us more..."
                    rows={3}
                    value={form.message}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, message: e.target.value }))
                    }
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSubmit}
                    disabled={
                      form.rating === 0 || !form.category || !form.message.trim()
                    }
                  >
                    Send Feedback
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <Button
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => setIsOpen(true)}
          aria-label="Open feedback"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
