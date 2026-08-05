/**
 * BuildSignal v5.4.7 — Error Types & Classifications
 */

export class BuildSignalError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "BuildSignalError";
  }

  toJSON() {
    return {
      error: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

export class UnauthorizedError extends BuildSignalError {
  constructor(message = "Unauthorized") {
    super(message, "UNAUTHORIZED", 401);
  }
}

export class ForbiddenError extends BuildSignalError {
  constructor(message = "Forbidden") {
    super(message, "FORBIDDEN", 403);
  }
}

export class NotFoundError extends BuildSignalError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, "NOT_FOUND", 404);
  }
}

export class ValidationError extends BuildSignalError {
  constructor(message = "Validation failed", details?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", 400, details);
  }
}

export class KestovarError extends BuildSignalError {
  constructor(
    message = "Kestovar engine unavailable",
    public readonly kestovarCode?: string
  ) {
    super(message, "KESTOVAR_ERROR", 503, { kestovarCode });
  }
}

export class StripeError extends BuildSignalError {
  constructor(message = "Stripe error", details?: Record<string, unknown>) {
    super(message, "STRIPE_ERROR", 400, details);
  }
}

export class RateLimitError extends BuildSignalError {
  constructor(retryAfter?: number) {
    super("Rate limit exceeded", "RATE_LIMIT", 429, { retryAfter });
  }
}
