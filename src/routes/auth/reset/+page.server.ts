import { fail, redirect } from '@sveltejs/kit';
import { requireDb } from '$server/db';
import { hashPassword, sha256 } from '$server/crypto';

export const actions = {
  default: async ({ request, platform }) => {
    const form = await request.formData();
    const token = String(form.get('token') || '');
    const password = String(form.get('password') || '');
    if (
      password.length < 12 ||
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password)
    )
      return fail(400, {
        message: 'Use at least 12 characters with upper, lower and numeric characters.'
      });
    const db = requireDb(platform);
    const row = await db
      .prepare(
        "SELECT id, user_id FROM password_reset_tokens WHERE token_hash = ? AND used_at IS NULL AND expires_at > datetime('now')"
      )
      .bind(await sha256(token))
      .first<{ id: string; user_id: string }>();
    if (!row) return fail(400, { message: 'This reset link is invalid or has expired.' });
    await db.batch([
      db
        .prepare("UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?")
        .bind(await hashPassword(password), row.user_id),
      db
        .prepare("UPDATE password_reset_tokens SET used_at = datetime('now') WHERE id = ?")
        .bind(row.id),
      db.prepare('DELETE FROM sessions WHERE user_id = ?').bind(row.user_id)
    ]);
    redirect(303, '/auth/login?reset=1');
  }
};
