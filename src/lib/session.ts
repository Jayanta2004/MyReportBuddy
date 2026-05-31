import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

/** Cookie name used to identify an anonymous browser session. */
export const SESSION_COOKIE = 'mrb_session';

/** Cookie lifetime: 1 year (seconds). Refreshed on every successful analysis. */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Read the session ID from the incoming request cookie.
 * Returns `null` if the cookie is absent or empty.
 */
export function getSessionId(request: NextRequest): string | null {
  const value = request.cookies.get(SESSION_COOKIE)?.value;
  return value && value.length > 0 ? value : null;
}

/** Generate a new random session ID (UUID v4). */
export function generateSessionId(): string {
  return uuidv4();
}
