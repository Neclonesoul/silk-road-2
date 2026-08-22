import { error, json } from '@sveltejs/kit';
import { requireDb } from '$server/db';

export const PUT = async ({ params, platform, locals }) => {
  if (!locals.user) error(401, 'Sign in required');
  if (locals.user.id === params.userId) error(400, 'You cannot block yourself');
  await requireDb(platform)
    .prepare('INSERT OR IGNORE INTO blocks (blocker_id, blocked_id) VALUES (?, ?)')
    .bind(locals.user.id, params.userId)
    .run();
  return json({ blocked: true });
};
export const DELETE = async ({ params, platform, locals }) => {
  if (!locals.user) error(401, 'Sign in required');
  await requireDb(platform)
    .prepare('DELETE FROM blocks WHERE blocker_id = ? AND blocked_id = ?')
    .bind(locals.user.id, params.userId)
    .run();
  return json({ blocked: false });
};
