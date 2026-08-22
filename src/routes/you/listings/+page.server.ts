import { redirect } from '@sveltejs/kit';
import { requireDb } from '$server/db';
import { plain } from '$lib/server/db';

export const load = async ({ platform, locals }) => {
  if (!locals.user) redirect(303, '/auth/login?returnTo=/you/listings');
  const result = await requireDb(platform)
    .prepare(
      `SELECT l.*, c.name AS category_name, (SELECT object_key FROM listing_images WHERE listing_id = l.id ORDER BY is_cover DESC, sort_order LIMIT 1) AS cover_key, (SELECT COUNT(*) FROM favorites WHERE listing_id = l.id) AS favorite_count FROM listings l JOIN categories c ON c.id = l.category_id WHERE l.seller_id = ? ORDER BY l.updated_at DESC`
    )
    .bind(locals.user.id)
    .all();
  return plain({ listings: result.results });
};
