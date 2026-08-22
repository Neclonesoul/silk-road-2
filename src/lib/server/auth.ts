import type { Cookies } from '@sveltejs/kit';
import { sha256, randomToken } from '$server/crypto';
import { sessionUser } from '$server/db';

const SESSION_SECONDS = 60 * 60 * 24 * 30;

export function sessionCookieName(env?: Env): string {
  return env?.SESSION_COOKIE_NAME || 'silk_session';
}

export async function createSession(db: D1Database, cookies: Cookies, userId: string, env?: Env) {
  const token = randomToken();
  const tokenHash = await sha256(token);
  await db
    .prepare(
      "INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, datetime('now', '+30 days'))"
    )
    .bind(crypto.randomUUID(), userId, tokenHash)
    .run();
  cookies.set(sessionCookieName(env), token, {
    path: '/',
    httpOnly: true,
    secure: env?.APP_ENV !== 'development',
    sameSite: 'lax',
    maxAge: SESSION_SECONDS
  });
}

export async function destroySession(db: D1Database, cookies: Cookies, env?: Env) {
  const name = sessionCookieName(env);
  const token = cookies.get(name);
  if (token)
    await db
      .prepare('DELETE FROM sessions WHERE token_hash = ?')
      .bind(await sha256(token))
      .run();
  cookies.delete(name, { path: '/' });
}

export async function resolveSession(db: D1Database, token: string | undefined) {
  if (!token || token.length > 128) return null;
  return sessionUser(db, await sha256(token));
}

export function requireUser(locals: App.Locals) {
  if (!locals.user) throw new Response('Sign in required', { status: 401 });
  return locals.user;
}

export function isAdmin(user: App.Locals['user']): boolean {
  return user?.role === 'admin' || user?.role === 'moderator';
}
