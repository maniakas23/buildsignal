import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface GracefulDegradationProps {
  error?: Error;
  fallback?: React.ReactNode;
}

export function GracefulDegradation({ error, fallback }: GracefulDegradationProps) {
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Component Error</AlertTitle>
      <AlertDescription>
        {error?.message || "An unexpected error occurred. Please try again."}
      </AlertDescription>
    </Alert>
  );
}

export default GracefulDegradation;
