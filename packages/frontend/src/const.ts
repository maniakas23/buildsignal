/**
 * BuildSignal Constants
 * Centralized configuration constants for the application
 */

export const APP_NAME = "BuildSignal";
export const APP_VERSION = "5.4.7";
export const APP_TAGLINE = "Commercial Intelligence Platform";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
export const KESTOVAR_BASE_URL = import.meta.env.VITE_KESTOVAR_URL || "https://api.kestovar.buildsignal.net";

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const CONFIDENCE_THRESHOLDS = {
  HIGH: 80,
  MEDIUM: 50,
  LOW: 20,
} as const;

export const ALERT_SEVERITY = {
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
  INFO: "info",
} as const;

export const OPPORTUNITY_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ARCHIVED: "archived",
  ACTED: "acted",
} as const;

export const RECOMMENDATION_STATUS = {
  NEW: "new",
  SAVED: "saved",
  DISMISSED: "dismissed",
  ACTED: "acted",
} as const;

export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";

export const ONBOARDING_STEPS = [
  { id: "profile", label: "Complete your profile" },
  { id: "watchlist", label: "Add counties to watchlist" },
  { id: "alert", label: "Set up alert preferences" },
  { id: "report", label: "Generate your first report" },
] as const;

export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";
