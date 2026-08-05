import { useState } from "react";
import { MessageSquare, Star, ThumbsUp, ThumbsDown, Send } from "lucide-react";

export function CustomerFeedback() {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating > 0) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setRating(0);
      setComment("");
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Feedback</h3>
      </div>

      {submitted ? (
        <div className="p-4 rounded-lg bg-green-50 text-green-700 text-sm">
          Thank you for your feedback!
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium mb-2">How would you rate your experience?</div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= (hoveredRating || rating)
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">Comments</div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm min-h-[100px]"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={rating === 0}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Submit Feedback
          </button>
        </div>
      )}
    </div>
  );
}
