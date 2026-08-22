import { redirect } from '@sveltejs/kit';
import { requireDb } from '$server/db';

export const load = async ({ platform, locals }) => {
  if (!locals.user) redirect(303, '/auth/login?returnTo=/favourites');
  const result = await requireDb(platform)
    .prepare(
      `SELECT l.id, l.slug, l.title, l.price_cents AS priceCents, l.price_negotiable AS priceNegotiable, l.locality, l.region, l.condition, l.status, l.published_at AS publishedAt, (SELECT object_key FROM listing_images WHERE listing_id = l.id ORDER BY is_cover DESC, sort_order LIMIT 1) AS coverKey, p.handle AS sellerHandle, p.display_name AS sellerName, u.email_verified AS sellerVerified, 1 AS isFavorite FROM favorites f JOIN listings l ON l.id = f.listing_id JOIN users u ON u.id = l.seller_id JOIN profiles p ON p.user_id = u.id WHERE f.user_id = ? AND l.status IN ('active','reserved') ORDER BY f.created_at DESC`
    )
    .bind(locals.user.id)
    .all();
  return { listings: result.results };
};
