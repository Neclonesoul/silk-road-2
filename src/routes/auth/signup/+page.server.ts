import { fail, redirect } from '@sveltejs/kit';
import { signupSchema, firstIssue } from '$server/validation';
import { requireDb, audit } from '$server/db';
import { hashPassword, randomToken, sha256 } from '$server/crypto';
import { createSession } from '$server/auth';
import { sendTransactionalEmail, verificationMessage } from '$server/email';
import { verifyTurnstile } from '$server/turnstile';
import { allowRequest } from '$server/rate-limit';

export const actions = {
  default: async ({ request, platform, cookies, getClientAddress, locals, url }) => {
    const env = platform?.env;
    if (!env)
      return fail(503, {
        message: 'Account creation is unavailable until deployment is configured.'
      });
    const form = await request.formData();
    const input = Object.fromEntries(form);
    const parsed = signupSchema.safeParse(input);
    if (!parsed.success)
      return fail(400, {
        message: firstIssue(parsed.error),
        values: {
          email: input.email,
          displayName: input.displayName,
          handle: input.handle,
          locality: input.locality,
          region: input.region
        }
      });
    if (
      !(await verifyTurnstile(
        env,
        String(form.get('cf-turnstile-response') || ''),
        getClientAddress()
      ))
    )
      return fail(400, { message: 'Please complete the security check.' });
    const db = requireDb(platform);
    if (!(await allowRequest(db, 'auth-signup', getClientAddress(), 5, 3600)))
      return fail(429, { message: 'Too many signup attempts. Please try again later.' });
    const userId = crypto.randomUUID();
    const verificationToken = randomToken();
    const admins = (env.ADMIN_EMAILS || '')
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);
    try {
      await db.batch([
        db
          .prepare('INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)')
          .bind(
            userId,
            parsed.data.email,
            await hashPassword(parsed.data.password),
            admins.includes(parsed.data.email) ? 'admin' : 'user'
          ),
        db
          .prepare(
            'INSERT INTO profiles (user_id, handle, display_name, locality, region) VALUES (?, ?, ?, ?, ?)'
          )
          .bind(
            userId,
            parsed.data.handle,
            parsed.data.displayName,
            parsed.data.locality,
            parsed.data.region
          ),
        db
          .prepare(
            "INSERT INTO verification_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, datetime('now', '+24 hours'))"
          )
          .bind(crypto.randomUUID(), userId, await sha256(verificationToken))
      ]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      console.error(
        JSON.stringify({
          level: 'error',
          event: 'auth.signup.db_batch_failed',
          requestId: locals.requestId,
          error: errorMessage
        })
      );

      const message = /unique/i.test(errorMessage)
        ? 'That email address or handle is already in use.'
        : 'We could not create your account.';

      return fail(409, { message });
    }
    const verifyUrl = `${url.origin}/auth/verify?token=${encodeURIComponent(verificationToken)}`;
    const email = verificationMessage(verifyUrl);
    await sendTransactionalEmail(env, parsed.data.email, email.subject, email.text);
    await createSession(db, cookies, userId, env);
    await audit(db, userId, 'user.signup', 'user', userId, locals.requestId);
    redirect(303, '/auth/check-email');
  }
};
