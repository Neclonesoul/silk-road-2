import { fail, redirect } from '@sveltejs/kit';
import { loginSchema } from '$server/validation';
import { requireDb, audit } from '$server/db';
import { verifyPassword } from '$server/crypto';
import { createSession } from '$server/auth';
import { safeReturnTo } from '$lib/utils';
import { verifyTurnstile } from '$server/turnstile';
import { allowRequest } from '$server/rate-limit';

export const actions = {
  default: async ({ request, platform, cookies, getClientAddress, locals }) => {
    const env = platform?.env;
    if (!env)
      return fail(503, { message: 'Sign in is unavailable until deployment is configured.' });
    const form = await request.formData();
    const parsed = loginSchema.safeParse(Object.fromEntries(form));
    if (!parsed.success) return fail(400, { message: 'Enter a valid email address and password.' });
    if (
      !(await verifyTurnstile(
        env,
        String(form.get('cf-turnstile-response') || ''),
        getClientAddress()
      ))
    )
      return fail(400, { message: 'Please complete the security check.' });
    const db = requireDb(platform);
    if (
      !(await allowRequest(db, 'auth-login', `${getClientAddress()}:${parsed.data.email}`, 10, 900))
    )
      return fail(429, { message: 'Too many sign-in attempts. Please wait before trying again.' });
    const user = await db
      .prepare("SELECT id, password_hash FROM users WHERE email = ? AND status = 'active'")
      .bind(parsed.data.email)
      .first<{ id: string; password_hash: string }>();
    if (!user || !(await verifyPassword(user.password_hash, parsed.data.password)))
      return fail(400, { message: 'Email or password is incorrect.' });
    await db
      .prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?")
      .bind(user.id)
      .run();
    await createSession(db, cookies, user.id, env);
    await audit(db, user.id, 'user.login', 'user', user.id, locals.requestId);
    redirect(303, safeReturnTo(form.get('returnTo'), '/'));
  }
};
