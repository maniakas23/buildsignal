import { KESTOVAR_CONTRACT_VERSION } from "../../contracts/constants";

export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private limit: number;
  private window: number;

  constructor(limit = 100, windowMs = 60000) {
    this.limit = limit;
    this.window = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    const validTimestamps = timestamps.filter((t) => now - t < this.window);
    
    if (validTimestamps.length >= this.limit) {
      return false;
    }
    
    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);
    return true;
  }

  getRemaining(key: string): number {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    const validTimestamps = timestamps.filter((t) => now - t < this.window);
    return Math.max(0, this.limit - validTimestamps.length);
  }

  getResetTime(key: string): number {
    const timestamps = this.requests.get(key) || [];
    if (timestamps.length === 0) return 0;
    return Math.ceil((timestamps[0] + this.window) / 1000);
  }
}

export function createRateLimiter(limit?: number, windowMs?: number): RateLimiter {
  return new RateLimiter(limit, windowMs);
}
