import { useState } from "react";
import { AlertTriangle, X, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface SurgeAlertModalProps {
  county?: string;
  permits?: number;
  onDismiss?: () => void;
}

export function SurgeAlertModal({ county, permits, onDismiss }: SurgeAlertModalProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
            <span className="font-semibold">Surge Alert</span>
          </div>
          <button
            onClick={() => { setIsVisible(false); onDismiss?.(); }}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="text-3xl font-bold mb-1">{permits || 0}</div>
          <div className="text-sm text-muted-foreground mb-4">
            New permits in {county || "this county"} this month
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span>40% above historical average</span>
          </div>
        </div>

        <Link
          to="/opportunities"
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          onClick={() => setIsVisible(false)}
        >
          View on Map
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
