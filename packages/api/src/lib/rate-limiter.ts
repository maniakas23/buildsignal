/**
 * Rate Limiter — Build 110 / v1.1.0
 * Simple token bucket rate limiter for Cloudflare Workers
 */

interface RateLimitConfig {
  requests: number;
  window: number; // seconds
}

interface RateLimitState {
  tokens: number;
  lastRefill: number;
}

const states = new Map<string, RateLimitState>();

export function checkRateLimit(
  key: string,
  config: RateLimitConfig = { requests: 100, window: 60 }
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const windowMs = config.window * 1000;

  let state = states.get(key);
  if (!state) {
    state = { tokens: config.requests, lastRefill: now };
    states.set(key, state);
  }

  // Refill tokens
  const elapsed = now - state.lastRefill;
  const tokensToAdd = Math.floor((elapsed / windowMs) * config.requests);
  if (tokensToAdd > 0) {
    state.tokens = Math.min(config.requests, state.tokens + tokensToAdd);
    state.lastRefill = now;
  }

  if (state.tokens > 0) {
    state.tokens--;
    return {
      allowed: true,
      remaining: state.tokens,
      resetAt: Math.ceil((state.lastRefill + windowMs) / 1000),
    };
  }

  return {
    allowed: false,
    remaining: 0,
    resetAt: Math.ceil((state.lastRefill + windowMs) / 1000),
  };
}

export function resetRateLimit(key: string): void {
  states.delete(key);
}
