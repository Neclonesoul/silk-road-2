import { redirect } from '@sveltejs/kit';
import { sha256 } from '$server/crypto';
import { requireDb } from '$server/db';

export const GET = async ({ url, platform }) => {
  const token = url.searchParams.get('token') || '';
  const db = requireDb(platform);
  const row = await db
    .prepare(
      "SELECT id, user_id FROM verification_tokens WHERE token_hash = ? AND used_at IS NULL AND expires_at > datetime('now')"
    )
    .bind(await sha256(token))
    .first<{ id: string; user_id: string }>();
  if (!row) redirect(303, '/auth/check-email?invalid=1');
  await db.batch([
    db
      .prepare("UPDATE users SET email_verified = 1, updated_at = datetime('now') WHERE id = ?")
      .bind(row.user_id),
    db.prepare("UPDATE verification_tokens SET used_at = datetime('now') WHERE id = ?").bind(row.id)
  ]);
  redirect(303, '/you?verified=1');
};
