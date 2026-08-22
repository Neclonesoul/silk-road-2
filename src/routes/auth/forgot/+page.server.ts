import { fail } from '@sveltejs/kit';
import { requireDb } from '$server/db';
import { randomToken, sha256 } from '$server/crypto';
import { sendTransactionalEmail, resetMessage } from '$server/email';
import { verifyTurnstile } from '$server/turnstile';
import { allowRequest } from '$server/rate-limit';

export const actions = {
  default: async ({ request, platform, getClientAddress, url }) => {
    const env = platform?.env;
    if (!env)
      return fail(503, {
        message: 'Password reset is unavailable until deployment is configured.'
      });
    const form = await request.formData();
    if (
      !(await verifyTurnstile(
        env,
        String(form.get('cf-turnstile-response') || ''),
        getClientAddress()
      ))
    )
      return fail(400, { message: 'Please complete the security check.' });
    const email = String(form.get('email') || '')
      .trim()
      .toLowerCase();
    const db = requireDb(platform);
    if (!(await allowRequest(db, 'auth-reset', `${getClientAddress()}:${email}`, 4, 3600)))
      return { success: true };
    const user = await db
      .prepare("SELECT id FROM users WHERE email = ? AND status = 'active'")
      .bind(email)
      .first<{ id: string }>();
    if (user) {
      const token = randomToken();
      await db
        .prepare(
          "INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, datetime('now', '+1 hour'))"
        )
        .bind(crypto.randomUUID(), user.id, await sha256(token))
        .run();
      const message = resetMessage(`${url.origin}/auth/reset?token=${encodeURIComponent(token)}`);
      await sendTransactionalEmail(env, email, message.subject, message.text);
    }
    return { success: true };
  }
};
