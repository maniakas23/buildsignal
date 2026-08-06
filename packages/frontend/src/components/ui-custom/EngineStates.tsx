import { Activity, AlertTriangle, CheckCircle2, Clock, Database, Globe, Loader2, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type React from "react";

export function EngineLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-8 h-8 text-accent-indigo animate-spin" />
      <p className="text-sm text-ink-secondary mt-3">Loading data...</p>
    </div>
  );
}

export function EngineError({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <WifiOff className="w-8 h-8 text-accent-crimson" />
      <p className="text-sm text-ink-secondary mt-3">{message}</p>
      {retry && (
        <button onClick={retry} className="mt-3 text-sm text-accent-indigo hover:underline">
          Retry
        </button>
      )}
    </div>
  );
}

export function EngineEmpty({ message = "No data available" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Database className="w-8 h-8 text-ink-tertiary" />
      <p className="text-sm text-ink-secondary mt-3">{message}</p>
    </div>
  );
}

type EmptyVariant = "default" | "signals" | "opportunities" | "recommendations" | "alerts" | "projects";

interface EmptyProps {
  variant?: EmptyVariant;
  title?: string;
  message?: string;
  description?: string;
  icon?: React.ReactNode;
  onAction?: () => void;
  actionLabel?: string;
}

export function Empty({ variant = "default", title, message, description, icon, onAction, actionLabel }: EmptyProps) {
  const content = {
    default: { title: title || "No data", message: message || "Nothing to display" },
    signals: { title: "No signals found", message: "Try adjusting your filters" },
    opportunities: { title: "No opportunities", message: "Check back later for new leads" },
    recommendations: { title: "No recommendations", message: "Complete your profile to get personalized suggestions" },
    alerts: { title: "No alerts", message: "Set up alerts to get notified" },
    projects: { title: "No projects", message: "Start tracking projects to see them here" },
  }[variant];

  return (
    <div className="flex flex-col items-center justify-center py-12">
      {icon || <AlertTriangle className="w-8 h-8 text-ink-tertiary" />}
      <p className="text-sm font-medium text-ink-primary mt-3">{content.title}</p>
      <p className="text-xs text-ink-secondary mt-1">{description || content.message}</p>
      {onAction && (
        <button onClick={onAction} className="mt-3 text-sm text-accent-indigo hover:underline">
          {actionLabel || "Action"}
        </button>
      )}
    </div>
  );
}

interface FreshnessProps {
  timestamp?: string | number | Date | null;
  generatedAt?: string | number | Date | null;
}

export function Freshness({ timestamp, generatedAt }: FreshnessProps) {
  const ts = generatedAt || timestamp;
  if (!ts) return <span className="text-xs text-ink-tertiary">Never updated</span>;
  const date = new Date(ts);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
  let label: string;
  if (diff < 1) label = "Just now";
  else if (diff < 60) label = `${diff}m ago`;
  else if (diff < 1440) label = `${Math.floor(diff / 60)}h ago`;
  else label = `${Math.floor(diff / 1440)}d ago`;
  return <span className="text-xs text-ink-tertiary">Updated {label}</span>;
}
