/**
 * Rate Limiter with in-memory storage
 * For production, consider using Redis or Upstash
 */

interface RateLimitConfig {
  windowMs?: number; // Time window in milliseconds
  maxRequests?: number; // Max requests per window
  message?: string; // Error message when rate limit exceeded
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Check if request should bypass rate limiting
 */
export function shouldBypassRateLimit(request: any): boolean {
  // Bypass in demo mode
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    console.log('🎭 Demo: Rate limiter bypassed');
    return true;
  }

  // Bypass for internal requests
  const isInternal = request?.headers?.get('x-internal-request') === 'true';
  if (isInternal) {
    return true;
  }

  return false;
}

/**
 * Rate Limiter class
 */
export class RateLimiter {
  private windowMs: number;
  private maxRequests: number;
  private message: string;

  constructor(config: RateLimitConfig = {}) {
    this.windowMs = config.windowMs || 60 * 1000; // Default: 1 minute
    this.maxRequests = config.maxRequests || 60; // Default: 60 requests per minute
    this.message = config.message || 'Too many requests, please try again later';

    console.log(
      `🛡️  Rate limiter initialized: ${this.maxRequests} requests per ${this.windowMs / 1000}s`
    );
  }

  /**
   * Check if request is allowed
   */
  async isAllowed(key: string): Promise<boolean> {
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry) {
      // First request from this key
      rateLimitStore.set(key, {
        count: 1,
        resetAt: now + this.windowMs,
      });
      return true;
    }

    // Check if window has expired
    if (entry.resetAt < now) {
      // Reset the counter
      rateLimitStore.set(key, {
        count: 1,
        resetAt: now + this.windowMs,
      });
      return true;
    }

    // Increment counter
    entry.count++;

    // Check if limit exceeded
    if (entry.count > this.maxRequests) {
      return false;
    }

    return true;
  }

  /**
   * Increment counter for a key
   */
  async increment(key: string): Promise<void> {
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || entry.resetAt < now) {
      rateLimitStore.set(key, {
        count: 1,
        resetAt: now + this.windowMs,
      });
    } else {
      entry.count++;
    }
  }

  /**
   * Get remaining requests for a key
   */
  async getRemaining(key: string): Promise<number> {
    const entry = rateLimitStore.get(key);

    if (!entry) {
      return this.maxRequests;
    }

    const now = Date.now();
    if (entry.resetAt < now) {
      return this.maxRequests;
    }

    return Math.max(0, this.maxRequests - entry.count);
  }

  /**
   * Get time until reset (in seconds)
   */
  async getResetTime(key: string): Promise<number> {
    const entry = rateLimitStore.get(key);

    if (!entry) {
      return 0;
    }

    const now = Date.now();
    if (entry.resetAt < now) {
      return 0;
    }

    return Math.ceil((entry.resetAt - now) / 1000);
  }

  /**
   * Reset counter for a key
   */
  async reset(key: string): Promise<void> {
    rateLimitStore.delete(key);
  }

  /**
   * Get error message
   */
  getMessage(): string {
    return this.message;
  }
}

/**
 * Create a rate limiter middleware for Next.js API routes
 */
export function createRateLimitMiddleware(config: RateLimitConfig = {}) {
  const limiter = new RateLimiter(config);

  return async function rateLimitMiddleware(
    request: Request,
    getKey?: (req: Request) => string
  ): Promise<{ success: boolean; message?: string; remaining?: number; resetAt?: number }> {
    // Check if should bypass
    if (shouldBypassRateLimit(request)) {
      return { success: true };
    }

    // Get key (default: IP address or user ID)
    const key = getKey
      ? getKey(request)
      : request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown';

    const isAllowed = await limiter.isAllowed(key);
    const remaining = await limiter.getRemaining(key);
    const resetAt = await limiter.getResetTime(key);

    if (!isAllowed) {
      return {
        success: false,
        message: limiter.getMessage(),
        remaining: 0,
        resetAt,
      };
    }

    return {
      success: true,
      remaining,
      resetAt,
    };
  };
}

/**
 * Predefined rate limiters for common use cases
 */
export const rateLimiters = {
  // Strict: 10 requests per minute
  strict: new RateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 10,
    message: 'Too many requests. Please wait before trying again.',
  }),

  // Standard: 60 requests per minute
  standard: new RateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 60,
    message: 'Rate limit exceeded. Please try again later.',
  }),

  // Relaxed: 300 requests per minute
  relaxed: new RateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 300,
    message: 'Too many requests.',
  }),

  // Authentication: 5 attempts per 15 minutes
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    message: 'Too many login attempts. Please try again in 15 minutes.',
  }),

  // API: 100 requests per minute
  api: new RateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 100,
    message: 'API rate limit exceeded.',
  }),
};

export default RateLimiter;
