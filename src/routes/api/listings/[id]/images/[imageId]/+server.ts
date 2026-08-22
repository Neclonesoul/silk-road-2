import { error, json } from '@sveltejs/kit';
import { requireDb } from '$server/db';

export const DELETE = async ({ params, platform, locals }) => {
  if (!locals.user) error(401, 'Sign in required');
  const env = platform?.env;
  if (!env?.MEDIA) error(503, 'Image storage is not configured');
  const db = requireDb(platform);
  const image = await db
    .prepare(
      'SELECT li.object_key, li.is_cover, li.listing_id FROM listing_images li JOIN listings l ON l.id = li.listing_id WHERE li.id = ? AND li.listing_id = ? AND l.seller_id = ?'
    )
    .bind(params.imageId, params.id, locals.user.id)
    .first<{ object_key: string; is_cover: number; listing_id: string }>();
  if (!image) error(404, 'Image not found');
  await db.prepare('DELETE FROM listing_images WHERE id = ?').bind(params.imageId).run();
  await env.MEDIA.delete(image.object_key);
  if (image.is_cover)
    await db
      .prepare(
        'UPDATE listing_images SET is_cover = 1 WHERE id = (SELECT id FROM listing_images WHERE listing_id = ? ORDER BY sort_order LIMIT 1)'
      )
      .bind(params.id)
      .run();
  return json({ ok: true });
};
