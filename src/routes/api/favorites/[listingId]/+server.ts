import { error, json } from '@sveltejs/kit';
import { requireDb } from '$server/db';

export const PUT = async ({ params, platform, locals }) => {
  if (!locals.user) error(401, 'Sign in required');
  const db = requireDb(platform);
  if (
    !(await db
      .prepare("SELECT 1 FROM listings WHERE id = ? AND status IN ('active','reserved')")
      .bind(params.listingId)
      .first())
  )
    error(404, 'Listing not found');
  await db
    .prepare('INSERT OR IGNORE INTO favorites (user_id, listing_id) VALUES (?, ?)')
    .bind(locals.user.id, params.listingId)
    .run();
  return json({ favorite: true });
};

export const DELETE = async ({ params, platform, locals }) => {
  if (!locals.user) error(401, 'Sign in required');
  await requireDb(platform)
    .prepare('DELETE FROM favorites WHERE user_id = ? AND listing_id = ?')
    .bind(locals.user.id, params.listingId)
    .run();
  return json({ favorite: false });
};
