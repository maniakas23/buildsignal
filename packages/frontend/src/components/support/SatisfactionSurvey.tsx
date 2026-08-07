import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, CheckCircle2 } from "lucide-react";

interface SatisfactionSurveyProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SatisfactionSurvey({ open, onOpenChange }: SatisfactionSurveyProps) {
  const [step, setStep] = useState(1);
  const [satisfaction, setSatisfaction] = useState(0);
  const [hoverSatisfaction, setHoverSatisfaction] = useState(0);
  const [nps, setNps] = useState<number | null>(null);
  const [improvement, setImprovement] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep(1);
      setSatisfaction(0);
      setNps(null);
      setImprovement("");
      setSubmitted(false);
    }, 300);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      handleClose();
    }, 2500);
  };

  const npsLabels: Record<number, string> = {
    0: "Not at all likely",
    1: "Not at all likely",
    2: "Not at all likely",
    3: "Not at all likely",
    4: "Not at all likely",
    5: "Not at all likely",
    6: "Not at all likely",
    7: "Somewhat likely",
    8: "Somewhat likely",
    9: "Very likely",
    10: "Extremely likely",
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {submitted ? "Thank You!" : "Quick Feedback"}
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
            <p className="text-muted-foreground">
              We appreciate your feedback. It helps us make BuildSignal better
              for you.
            </p>
            <Button onClick={handleClose} className="mt-2">
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-2">
            {/* Step 1: Satisfaction */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Question 1 of 3
                </div>
                <p className="font-medium">
                  How satisfied are you with BuildSignal?
                </p>
                <div className="flex items-center justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="p-1 transition-colors"
                      onMouseEnter={() => setHoverSatisfaction(star)}
                      onMouseLeave={() => setHoverSatisfaction(0)}
                      onClick={() => setSatisfaction(star)}
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          star <= (hoverSatisfaction || satisfaction)
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30"
                        }}
                      />
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span>Very dissatisfied</span>
                  <span>Very satisfied</span>
                </div>
                <Button
                  className="w-full"
                  disabled={satisfaction === 0}
                  onClick={() => setStep(2)}
                >
                  Next
                </Button>
              </div>
            )}

            {/* Step 2: NPS */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Question 2 of 3
                </div>
                <p className="font-medium">
                  How likely are you to recommend us?
                </p>
                <div className="flex items-center justify-center gap-1.5">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={`h-8 w-7 rounded-md text-xs font-medium transition-colors ${
                        nps === num
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-accent text-foreground"
                      }`}
                      onClick={() => setNps(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span>Not at all likely</span>
                  <span>Extremely likely</span>
                </div>
                {nps !== null && (
                  <p className="text-xs text-center text-muted-foreground">
                    {npsLabels[nps]}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={nps === null}
                    onClick={() => setStep(3)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Improvement */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Question 3 of 3
                </div>
                <p className="font-medium">What could we improve?</p>
                <Textarea
                  placeholder="Tell us what we can do better..."
                  rows={4}
                  value={improvement}
                  onChange={(e) => setImprovement(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSubmit}
                  >
                    Submit
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
