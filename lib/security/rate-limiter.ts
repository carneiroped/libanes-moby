/**
 * Mock rate limiter for demo
 */

export function shouldBypassRateLimit(request: any): boolean {
  console.log('🎭 Demo: Rate limiter bypass check');
  // In demo mode, always bypass rate limiting
  return true;
}

export class RateLimiter {
  constructor(config?: any) {
    console.log('🎭 Demo: Rate limiter mock initialized');
  }

  async isAllowed(key: string): Promise<boolean> {
    console.log('🎭 Demo: Rate limit check for', key);
    return true; // Always allow in demo mode
  }

  async increment(key: string): Promise<void> {
    console.log('🎭 Demo: Rate limit increment for', key);
  }
}

export default RateLimiter;