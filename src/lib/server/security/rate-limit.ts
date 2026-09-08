/**
 * SkillBridge In-Memory Rate Limiter ($0 Free Tier / Self-Contained)
 *
 * Provides sliding-window rate limiting for sensitive endpoints (auth, messaging, payments, uploads).
 * Note: Since this is an in-memory store, limits apply per node/server process.
 * In a distributed multi-instance deployment, this can be swapped with a Redis-backed store.
 */

export interface RateLimitOptions {
  windowMs: number;
  max: number;
}

interface RateLimitRecord {
  timestamps: number[];
}

export class MemoryRateLimiter {
  private store = new Map<string, RateLimitRecord>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Periodically prune expired entries every 60 seconds
    if (typeof setInterval !== "undefined") {
      this.cleanupInterval = setInterval(() => this.prune(), 60000);
      if (this.cleanupInterval.unref) {
        this.cleanupInterval.unref();
      }
    }
  }

  check(key: string, options: RateLimitOptions): {
    success: boolean;
    limit: number;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const windowStart = now - options.windowMs;

    let record = this.store.get(key);
    if (!record) {
      record = { timestamps: [] };
      this.store.set(key, record);
    }

    // Filter out timestamps outside current window
    record.timestamps = record.timestamps.filter((t) => t > windowStart);

    const count = record.timestamps.length;
    const remaining = Math.max(0, options.max - count);
    const resetTime = Math.ceil(options.windowMs / 1000);

    if (count >= options.max) {
      return {
        success: false,
        limit: options.max,
        remaining: 0,
        resetTime,
      };
    }

    record.timestamps.push(now);

    return {
      success: true,
      limit: options.max,
      remaining: Math.max(0, options.max - record.timestamps.length),
      resetTime,
    };
  }

  private prune() {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      // Remove timestamps older than 5 minutes
      record.timestamps = record.timestamps.filter((t) => t > now - 300000);
      if (record.timestamps.length === 0) {
        this.store.delete(key);
      }
    }
  }

  // Helper for test resets
  clear() {
    this.store.clear();
  }
}

export const rateLimiter = new MemoryRateLimiter();

/**
 * Common rate limit configurations
 */
export const RATE_LIMITS = {
  AUTH: { windowMs: 60 * 1000, max: 5 },       // 5 per minute
  MESSAGING: { windowMs: 60 * 1000, max: 30 },  // 30 per minute
  PAYMENTS: { windowMs: 60 * 1000, max: 10 },   // 10 per minute
  UPLOADS: { windowMs: 60 * 1000, max: 20 },    // 20 per minute
};

/**
 * Extracts a client identifier from Request (IP address or fallback)
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
