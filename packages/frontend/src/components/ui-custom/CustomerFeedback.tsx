import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/hooks/useAnalytics";
import { ThumbsUp, ThumbsDown, AlertTriangle, MessageSquare, X } from "lucide-react";

interface CustomerFeedbackProps {
  recommendationId: number;
}

export function CustomerFeedback({ recommendationId }: CustomerFeedbackProps) {
  const [feedback, setFeedback] = useState<"up" | "down" | "report" | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportText, setReportText] = useState("");
  const { track } = useAnalytics();

  const handleFeedback = (type: "up" | "down") => {
    if (submitted) return;
    setFeedback(type);
    setSubmitted(true);

    track(type === "up" ? "feedback_thumbs_up" : "feedback_thumbs_down", {
      recommendationId,
    });
  };

  const handleReport = () => {
    if (!reportText.trim()) return;
    setFeedback("report");
    setSubmitted(true);
    setShowReportForm(false);

    track("feedback_report_inaccurate", { recommendationId, reason: reportText });
  };

  if (submitted && feedback === "report") {
    return (
      <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground flex items-center gap-2">
        <MessageSquare className="w-4 h-4" />
        Thank you for your feedback. We will investigate this report.
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground">
        {feedback === "up" ? "Glad this was helpful!" : "Thanks for letting us know."}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Was this helpful?</span>
        <Button variant="ghost" size="sm" onClick={() => handleFeedback("up")}>
          <ThumbsUp className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => handleFeedback("down")}>
          <ThumbsDown className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setShowReportForm(true)}>
          <AlertTriangle className="w-4 h-4" />
        </Button>
      </div>

      {showReportForm && (
        <div className="flex flex-col gap-2">
          <textarea
            className="w-full p-2 border rounded-md text-sm"
            placeholder="Please describe the issue..."
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowReportForm(false)}>
              <X className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={handleReport}>
              Submit
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerFeedback;
