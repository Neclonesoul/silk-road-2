import { redirect } from '@sveltejs/kit';
import { requireDb } from '$server/db';
import { plain } from '$lib/server/db';

export const load = async ({ platform, locals }) => {
  if (!locals.user) redirect(303, '/auth/login?returnTo=/notifications');
  const db = requireDb(platform);
  const result = await db
    .prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 100')
    .bind(locals.user.id)
    .all();
  await db
    .prepare(
      "UPDATE notifications SET read_at = COALESCE(read_at, datetime('now')) WHERE user_id = ?"
    )
    .bind(locals.user.id)
    .run();
  return plain({ notifications: result.results });
};
