import { error } from '@sveltejs/kit';
import { requireDb } from '$server/db';
import { plain } from '$lib/server/db';

export const load = async ({ params, platform, locals }) => {
  const db = requireDb(platform);
  const seller = await db
    .prepare(
      "SELECT p.user_id, p.handle, p.display_name, p.bio, p.avatar_key, p.locality, p.region, u.created_at, u.email_verified FROM profiles p JOIN users u ON u.id = p.user_id WHERE p.handle = ? AND u.status = 'active'"
    )
    .bind(params.handle)
    .first<Record<string, unknown>>();
  if (!seller) error(404, 'Seller not found');
  const listingResults = await db
    .prepare(
      `SELECT l.id, l.slug, l.title, l.price_cents AS priceCents, l.price_negotiable AS priceNegotiable, l.locality, l.region, l.condition, l.status, l.published_at AS publishedAt, (SELECT object_key FROM listing_images WHERE listing_id = l.id ORDER BY is_cover DESC, sort_order LIMIT 1) AS coverKey, p.handle AS sellerHandle, p.display_name AS sellerName, u.email_verified AS sellerVerified FROM listings l JOIN users u ON u.id = l.seller_id JOIN profiles p ON p.user_id = u.id WHERE l.seller_id = ? AND l.status = 'active' ORDER BY l.published_at DESC`
    )
    .bind(seller.user_id)
    .all();
  const sold = await db
    .prepare("SELECT COUNT(*) AS count FROM listings WHERE seller_id = ? AND status = 'sold'")
    .bind(seller.user_id)
    .first<{ count: number }>();
  const blocked = locals.user
    ? Boolean(
        await db
          .prepare('SELECT 1 FROM blocks WHERE blocker_id = ? AND blocked_id = ?')
          .bind(locals.user.id, seller.user_id)
          .first()
      )
    : false;
  return plain({ seller, listings: listingResults.results, soldCount: sold?.count || 0, blocked });
};
