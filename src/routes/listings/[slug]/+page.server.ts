import { error, fail, redirect } from '@sveltejs/kit';
import { listingBySlug, requireDb } from '$server/db';
import { plain } from '$lib/server/db';

export const load = async ({ params, platform, locals }) => {
  const db = requireDb(platform);
  const listing = await listingBySlug(db, params.slug, locals.user?.id);
  if (!listing) error(404, 'Listing not found');
  const record = listing as Record<string, any>;
  const related = await db
    .prepare(
      `SELECT l.id, l.slug, l.title, l.price_cents AS priceCents, l.price_negotiable AS priceNegotiable, l.locality, l.region, l.condition, l.status, l.published_at AS publishedAt, (SELECT object_key FROM listing_images WHERE listing_id = l.id ORDER BY is_cover DESC, sort_order LIMIT 1) AS coverKey, p.handle AS sellerHandle, p.display_name AS sellerName, u.email_verified AS sellerVerified FROM listings l JOIN users u ON u.id = l.seller_id JOIN profiles p ON p.user_id = u.id WHERE l.category_id = ? AND l.id <> ? AND l.status = 'active' ORDER BY l.published_at DESC LIMIT 6`
    )
    .bind(record.category_id, record.id)
    .all();
  return plain({ listing, related: related.results });
};

export const actions = {
  contact: async ({ params, platform, locals }) => {
    if (!locals.user)
      redirect(303, `/auth/login?returnTo=/listings/${encodeURIComponent(params.slug)}`);
    const db = requireDb(platform);
    const listing = await db
      .prepare(
        "SELECT id, seller_id FROM listings WHERE slug = ? AND status IN ('active','reserved')"
      )
      .bind(params.slug)
      .first<{ id: string; seller_id: string }>();
    if (!listing) return fail(404, { message: 'This listing is no longer available.' });
    if (listing.seller_id === locals.user.id)
      return fail(400, { message: 'This is your listing.' });
    const blocked = await db
      .prepare(
        'SELECT 1 FROM blocks WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)'
      )
      .bind(locals.user.id, listing.seller_id, listing.seller_id, locals.user.id)
      .first();
    if (blocked) return fail(403, { message: 'Conversation is unavailable.' });
    let conversation = await db
      .prepare(
        'SELECT id FROM conversations WHERE listing_id = ? AND buyer_id = ? AND seller_id = ?'
      )
      .bind(listing.id, locals.user.id, listing.seller_id)
      .first<{ id: string }>();
    if (!conversation) {
      const id = crypto.randomUUID();
      await db.batch([
        db
          .prepare(
            'INSERT INTO conversations (id, listing_id, buyer_id, seller_id) VALUES (?, ?, ?, ?)'
          )
          .bind(id, listing.id, locals.user.id, listing.seller_id),
        db
          .prepare('INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)')
          .bind(id, locals.user.id),
        db
          .prepare('INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)')
          .bind(id, listing.seller_id)
      ]);
      conversation = { id };
    }
    redirect(303, `/messages/${conversation.id}`);
  }
};
