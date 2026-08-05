import { useState } from "react";
import { AlertTriangle, RefreshCw, ArrowRight, CloudOff } from "lucide-react";

export function GracefulDegradation() {
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const handleReconnect = () => {
    setIsReconnecting(true);
    setTimeout(() => {
      setIsOnline(true);
      setIsReconnecting(false);
    }, 2000);
  };

  if (isOnline) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border rounded-lg shadow-lg p-6 max-w-md w-full mx-4 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-yellow-50 flex items-center justify-center mb-4">
          <CloudOff className="h-6 w-6 text-yellow-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Connection Issue</h3>
        <p className="text-sm text-muted-foreground mb-6">
          We're having trouble connecting to the intelligence engine. Some features may be unavailable.
        </p>
        <div className="space-y-2">
          <button
            onClick={handleReconnect}
            disabled={isReconnecting}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isReconnecting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Reconnecting...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Retry Connection
              </>
            )}
          </button>
          <button className="w-full rounded-lg border border-input px-4 py-2 text-sm hover:bg-accent">
            Continue with Limited Data
          </button>
        </div>
      </div>
    </div>
  );
}
