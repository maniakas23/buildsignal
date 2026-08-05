import { useEffect } from "react";
import { Sparkles, X } from "lucide-react";
import { useState } from "react";

export function WelcomeBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="p-4 border rounded-lg bg-primary/5 relative">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Welcome to BuildSignal</h3>
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        Your commercial intelligence platform is ready. Explore opportunities, track alerts, and get AI-powered recommendations.
      </p>
    </div>
  );
}
