import { useState } from "react";
import { Send, Star, X, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";

export function ProductFeedback() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
      setSubmitted(false);
      setRating(0);
      setFeedback("");
    }, 2000);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg hover:bg-primary/90"
        >
          <MessageSquare className="h-4 w-4" />
          Feedback
        </button>
      )}

      {isOpen && (
        <div className="bg-card border rounded-lg shadow-lg p-4 w-80">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-sm">Share Feedback</span>
            <button onClick={() => setIsOpen(false)} aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>

          {submitted ? (
            <div className="text-center py-4">
              <ThumbsUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm">Thank you for your feedback!</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      className={`h-5 w-5 ${
                        star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="What's working well? What could be better?"
                className="w-full min-h-[80px] rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
              />
              <button
                onClick={handleSubmit}
                disabled={rating === 0}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                Send Feedback
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
