import { RateLimiterMemory } from 'rate-limiter-flexible';
import { NextRequest } from 'next/server';

const maxRequests = parseInt(process.env.RATE_LIMIT_MAX || '10');
const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000');

const rateLimiter = new RateLimiterMemory({
  points: maxRequests,
  duration: Math.floor(windowMs / 1000),
});

export async function checkRateLimit(request: NextRequest): Promise<{
  allowed: boolean;
  remainingPoints?: number;
  msBeforeNext?: number;
}> {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';

  try {
    const result = await rateLimiter.consume(ip);
    return {
      allowed: true,
      remainingPoints: result.remainingPoints,
    };
  } catch (rejRes: unknown) {
    const rejection = rejRes as { msBeforeNext?: number };
    return {
      allowed: false,
      msBeforeNext: rejection.msBeforeNext,
    };
  }
}
