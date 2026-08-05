/**
 * BuildSignal v5.4.7 — Constants
 */

// API Versioning
export const API_VERSION = "v5.4.7" as const;
export const API_BUILD = 108 as const;
export const API_VERSION_DATE = "2026-08-06" as const;

// Kestovar Integration
export const KESTOVAR_CONTRACT_VERSION = "1.0.0" as const;
export const KESTOVAR_API_VERSION = "v1" as const;
export const KESTOVAR_DEFAULT_TIMEOUT = 30000 as const; // 30s
export const KESTOVAR_RETRY_ATTEMPTS = 3 as const;
export const KESTOVAR_RETRY_BACKOFF_MS = 1000 as const;
export const KESTOVAR_CIRCUIT_BREAKER_THRESHOLD = 5 as const;
export const KESTOVAR_CIRCUIT_BREAKER_RECOVERY_MS = 30000 as const; // 30s

// Rate Limits
export const RATE_LIMIT_REQUESTS = 100 as const;
export const RATE_LIMIT_WINDOW_MS = 60000 as const; // 60s

// Security
export const SESSION_COOKIE_NAME = "buildsignal-session" as const;
export const SESSION_MAX_AGE_SECONDS = 604800 as const; // 7 days
export const CSP_DIRECTIVE = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';" as const;

// Stripe
export const STRIPE_CURRENCY = "usd" as const;
export const STRIPE_CHECKOUT_SUCCESS_URL = "https://buildsignal.net/billing" as const;
export const STRIPE_CHECKOUT_CANCEL_URL = "https://buildsignal.net/pricing" as const;

// Feature Flags
export const FEATURE_FLAGS = {
  kestovarIntegration: true,
  enterpriseSso: true,
  stripeLiveMode: true,
  realTimeAlerts: true,
  patternAnalysis: true,
  knowledgeGraph: true,
  batchEventIngestion: true,
  correlationAnalysis: true,
} as const;
