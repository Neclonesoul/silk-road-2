import type { Handle, HandleServerError } from '@sveltejs/kit';
import { resolveSession, sessionCookieName } from '$server/auth';

const securityHeaders: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), payment=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Content-Security-Policy':
    "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; connect-src 'self' wss: https://challenges.cloudflare.com; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
};

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.requestId = crypto.randomUUID();
  event.locals.user = null;
  event.locals.sessionToken = null;
  const env = event.platform?.env;
  const token = event.cookies.get(sessionCookieName(env));
  if (env?.DB && token) {
    try {
      event.locals.user = await resolveSession(env.DB, token);
      event.locals.sessionToken = token;
    } catch {
      event.locals.user = null;
    }
  }
  const response = await resolve(event);
  for (const [name, value] of Object.entries(securityHeaders)) response.headers.set(name, value);
  response.headers.set('X-Request-Id', event.locals.requestId);
  if (event.url.pathname.startsWith('/api/') || event.locals.user)
    response.headers.set('Cache-Control', 'private, no-store');
  return response;
};

export const handleError: HandleServerError = ({ error, event, status, message }) => {
  console.error(
    JSON.stringify({
      level: 'error',
      requestId: event.locals.requestId,
      status,
      message,
      error: error instanceof Error ? error.message : 'unknown'
    })
  );
  return {
    message: status >= 500 ? 'Something went wrong. Please try again.' : message,
    requestId: event.locals.requestId
  };
};
