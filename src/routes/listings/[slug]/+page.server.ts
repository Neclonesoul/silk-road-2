import { error, fail, redirect } from '@sveltejs/kit';
import { audit, listingBySlug, requireDb } from '$server/db';
import { plain } from '$lib/server/db';
import { toCents } from '$lib/utils';

export const load = async ({ params, platform, locals }) => {
  const db = requireDb(platform);
  const listing = await listingBySlug(db, params.slug, locals.user?.id);

  if (!listing) error(404, 'Listing not found');

  const record = listing as Record<string, any>;

  const related = await db
    .prepare(
      `SELECT
         l.id,
         l.slug,
         l.title,
         l.price_cents AS priceCents,
         l.price_negotiable AS priceNegotiable,
         l.locality,
         l.region,
         l.condition,
         l.status,
         l.published_at AS publishedAt,
         (
           SELECT object_key
           FROM listing_images
           WHERE listing_id = l.id
           ORDER BY is_cover DESC, sort_order
           LIMIT 1
         ) AS coverKey,
         p.handle AS sellerHandle,
         p.display_name AS sellerName,
         u.email_verified AS sellerVerified
       FROM listings l
       JOIN users u ON u.id = l.seller_id
       JOIN profiles p ON p.user_id = u.id
       WHERE l.category_id = ?
         AND l.id <> ?
         AND l.status = 'active'
       ORDER BY l.published_at DESC
       LIMIT 6`
    )
    .bind(record.category_id, record.id)
    .all();

  let offers: unknown[] = [];
  let ownOffer: unknown = null;

  if (locals.user?.id === record.seller_id) {
    const result = await db
      .prepare(
        `SELECT
           o.*,
           p.display_name AS buyer_name,
           p.handle AS buyer_handle
         FROM offers o
         JOIN profiles p ON p.user_id = o.buyer_id
         WHERE o.listing_id = ?
         ORDER BY
           CASE o.status
             WHEN 'pending' THEN 0
             WHEN 'accepted' THEN 1
             ELSE 2
           END,
           o.created_at DESC`
      )
      .bind(record.id)
      .all();

    offers = result.results;
  } else if (locals.user) {
    ownOffer = await db
      .prepare(
        `SELECT *
         FROM offers
         WHERE listing_id = ?
           AND buyer_id = ?
         ORDER BY created_at DESC
         LIMIT 1`
      )
      .bind(record.id, locals.user.id)
      .first();
  }

  return plain({
    listing,
    related: related.results,
    offers,
    ownOffer
  });
};

export const actions = {
  contact: async ({ params, platform, locals }) => {
    if (!locals.user) {
      redirect(303, `/auth/login?returnTo=/listings/${encodeURIComponent(params.slug)}`);
    }

    const db = requireDb(platform);

    const listing = await db
      .prepare(
        "SELECT id, seller_id FROM listings WHERE slug = ? AND status IN ('active','reserved')"
      )
      .bind(params.slug)
      .first<{ id: string; seller_id: string }>();

    if (!listing) {
      return fail(404, { message: 'This listing is no longer available.' });
    }

    if (listing.seller_id === locals.user.id) {
      return fail(400, { message: 'This is your listing.' });
    }

    const blocked = await db
      .prepare(
        `SELECT 1
         FROM blocks
         WHERE (blocker_id = ? AND blocked_id = ?)
            OR (blocker_id = ? AND blocked_id = ?)`
      )
      .bind(locals.user.id, listing.seller_id, listing.seller_id, locals.user.id)
      .first();

    if (blocked) {
      return fail(403, { message: 'Conversation is unavailable.' });
    }

    let conversation = await db
      .prepare(
        `SELECT id
         FROM conversations
         WHERE listing_id = ?
           AND buyer_id = ?
           AND seller_id = ?`
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
  },

  makeOffer: async ({ request, params, platform, locals }) => {
    if (!locals.user) {
      redirect(303, `/auth/login?returnTo=/listings/${encodeURIComponent(params.slug)}`);
    }

    const db = requireDb(platform);

    const listing = await db
      .prepare(
        `SELECT id, seller_id, title, price_negotiable, status
         FROM listings
         WHERE slug = ?`
      )
      .bind(params.slug)
      .first<{
        id: string;
        seller_id: string;
        title: string;
        price_negotiable: number;
        status: string;
      }>();

    if (!listing || listing.status !== 'active') {
      return fail(409, { message: 'This listing is not accepting offers.' });
    }

    if (!listing.price_negotiable) {
      return fail(400, { message: 'The seller has not opened this listing to offers.' });
    }

    if (listing.seller_id === locals.user.id) {
      return fail(400, { message: 'You cannot make an offer on your own listing.' });
    }

    const form = await request.formData();
    const amountCents = toCents(String(form.get('amount') || ''));

    if (!Number.isInteger(amountCents) || amountCents <= 0 || amountCents > 100000000000) {
      return fail(400, { message: 'Enter a valid offer amount.' });
    }

    const existing = await db
      .prepare(
        `SELECT id
         FROM offers
         WHERE listing_id = ?
           AND buyer_id = ?
           AND status = 'pending'`
      )
      .bind(listing.id, locals.user.id)
      .first();

    if (existing) {
      return fail(409, { message: 'You already have a pending offer on this listing.' });
    }

    const offerId = crypto.randomUUID();

    await db.batch([
      db
        .prepare(
          `INSERT INTO offers
             (id, listing_id, buyer_id, seller_id, amount_cents)
           VALUES (?, ?, ?, ?, ?)`
        )
        .bind(offerId, listing.id, locals.user.id, listing.seller_id, amountCents),
      db
        .prepare(
          `INSERT INTO notifications
             (id, user_id, type, title, body, href)
           VALUES (?, ?, 'listing', ?, ?, ?)`
        )
        .bind(
          crypto.randomUUID(),
          listing.seller_id,
          `New offer on ${listing.title}`,
          `${locals.user.displayName} made an offer on your listing.`,
          `/listings/${params.slug}`
        )
    ]);

    await audit(db, locals.user.id, 'offer.create', 'offer', offerId, locals.requestId);

    return { offerCreated: true };
  },

  acceptOffer: async ({ request, params, platform, locals }) => {
    if (!locals.user) {
      return fail(401, { message: 'Sign in required.' });
    }

    const db = requireDb(platform);
    const form = await request.formData();
    const offerId = String(form.get('offerId') || '');

    const offer = await db
      .prepare(
        `SELECT
           o.id,
           o.listing_id,
           o.buyer_id,
           o.seller_id,
           o.amount_cents,
           o.status,
           l.title,
           l.status AS listing_status,
           l.slug
         FROM offers o
         JOIN listings l ON l.id = o.listing_id
         WHERE o.id = ?
           AND l.slug = ?
           AND o.seller_id = ?`
      )
      .bind(offerId, params.slug, locals.user.id)
      .first<{
        id: string;
        listing_id: string;
        buyer_id: string;
        seller_id: string;
        amount_cents: number;
        status: string;
        title: string;
        listing_status: string;
        slug: string;
      }>();

    if (!offer) {
      return fail(404, { message: 'Offer not found.' });
    }

    if (offer.status !== 'pending' || offer.listing_status !== 'active') {
      return fail(409, { message: 'This offer can no longer be accepted.' });
    }

    await db.batch([
      db
        .prepare(
          `UPDATE offers
           SET status = 'declined',
               declined_at = datetime('now'),
               updated_at = datetime('now')
           WHERE listing_id = ?
             AND status = 'pending'
             AND id <> ?`
        )
        .bind(offer.listing_id, offer.id),
      db
        .prepare(
          `UPDATE offers
           SET status = 'accepted',
               accepted_at = datetime('now'),
               updated_at = datetime('now')
           WHERE id = ?
             AND status = 'pending'`
        )
        .bind(offer.id),
      db
        .prepare(
          `UPDATE listings
           SET status = 'reserved',
               updated_at = datetime('now')
           WHERE id = ?
             AND seller_id = ?
             AND status = 'active'`
        )
        .bind(offer.listing_id, locals.user.id),
      db
        .prepare(
          `INSERT INTO notifications
             (id, user_id, type, title, body, href)
           VALUES (?, ?, 'listing', ?, ?, ?)`
        )
        .bind(
          crypto.randomUUID(),
          offer.buyer_id,
          `Offer accepted: ${offer.title}`,
          'The seller accepted your offer. The item is now reserved.',
          `/listings/${offer.slug}`
        )
    ]);

    await audit(db, locals.user.id, 'offer.accept', 'offer', offer.id, locals.requestId);

    return { offerAccepted: true };
  },

  declineOffer: async ({ request, params, platform, locals }) => {
    if (!locals.user) {
      return fail(401, { message: 'Sign in required.' });
    }

    const db = requireDb(platform);
    const form = await request.formData();
    const offerId = String(form.get('offerId') || '');

    const offer = await db
      .prepare(
        `SELECT o.id, o.buyer_id, o.status, l.title, l.slug
         FROM offers o
         JOIN listings l ON l.id = o.listing_id
         WHERE o.id = ?
           AND l.slug = ?
           AND o.seller_id = ?`
      )
      .bind(offerId, params.slug, locals.user.id)
      .first<{
        id: string;
        buyer_id: string;
        status: string;
        title: string;
        slug: string;
      }>();

    if (!offer) {
      return fail(404, { message: 'Offer not found.' });
    }

    if (offer.status !== 'pending') {
      return fail(409, { message: 'This offer has already been resolved.' });
    }

    await db.batch([
      db
        .prepare(
          `UPDATE offers
           SET status = 'declined',
               declined_at = datetime('now'),
               updated_at = datetime('now')
           WHERE id = ?
             AND status = 'pending'`
        )
        .bind(offer.id),
      db
        .prepare(
          `INSERT INTO notifications
             (id, user_id, type, title, body, href)
           VALUES (?, ?, 'listing', ?, ?, ?)`
        )
        .bind(
          crypto.randomUUID(),
          offer.buyer_id,
          `Offer declined: ${offer.title}`,
          'The seller declined your offer.',
          `/listings/${offer.slug}`
        )
    ]);

    await audit(db, locals.user.id, 'offer.decline', 'offer', offer.id, locals.requestId);

    return { offerDeclined: true };
  },

  withdrawOffer: async ({ request, params, platform, locals }) => {
    if (!locals.user) {
      return fail(401, { message: 'Sign in required.' });
    }

    const db = requireDb(platform);
    const form = await request.formData();
    const offerId = String(form.get('offerId') || '');

    const result = await db
      .prepare(
        `UPDATE offers
         SET status = 'withdrawn',
             withdrawn_at = datetime('now'),
             updated_at = datetime('now')
         WHERE id = ?
           AND buyer_id = ?
           AND listing_id = (
             SELECT id FROM listings WHERE slug = ?
           )
           AND status = 'pending'`
      )
      .bind(offerId, locals.user.id, params.slug)
      .run();

    if (!result.meta.changes) {
      return fail(409, { message: 'This offer can no longer be withdrawn.' });
    }

    await audit(db, locals.user.id, 'offer.withdraw', 'offer', offerId, locals.requestId);

    return { offerWithdrawn: true };
  }
};
