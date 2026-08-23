import { error, json } from '@sveltejs/kit';
import { audit, requireDb } from '$server/db';
import { canTransitionListing } from '$lib/domain/listings';
import type { ListingStatus } from '$lib/types';

export const PATCH = async ({ request, params, platform, locals }) => {
  if (!locals.user) error(401, 'Sign in required');

  const { status } = (await request.json()) as { status: string };

  if (!['active', 'reserved', 'sold', 'removed'].includes(status)) {
    error(400, 'Invalid listing state');
  }

  const db = requireDb(platform);

  const listing = await db
    .prepare(
      "SELECT status, title, slug FROM listings WHERE id = ? AND seller_id = ? AND status <> 'removed'"
    )
    .bind(params.id, locals.user.id)
    .first<{ status: string; title: string; slug: string }>();

  if (!listing) error(404, 'Listing not found');

  if (!canTransitionListing(listing.status as ListingStatus, status as ListingStatus)) {
    error(409, `Cannot change ${listing.status} to ${status}`);
  }

  const acceptedOffer = await db
    .prepare(
      `SELECT id, buyer_id
       FROM offers
       WHERE listing_id = ?
         AND status = 'accepted'
       LIMIT 1`
    )
    .bind(params.id)
    .first<{ id: string; buyer_id: string }>();

  const statements = [
    db
      .prepare(
        `UPDATE listings
         SET status = ?,
             sold_at = CASE
               WHEN ? = 'sold' THEN datetime('now')
               ELSE sold_at
             END,
             updated_at = datetime('now')
         WHERE id = ?
           AND seller_id = ?`
      )
      .bind(status, status, params.id, locals.user.id)
  ];

  if (acceptedOffer && status === 'sold') {
    statements.push(
      db
        .prepare(
          `UPDATE offers
           SET status = 'completed',
               completed_at = datetime('now'),
               updated_at = datetime('now')
           WHERE id = ?
             AND status = 'accepted'`
        )
        .bind(acceptedOffer.id),
      db
        .prepare(
          `INSERT INTO notifications
             (id, user_id, type, title, body, href)
           VALUES (?, ?, 'listing', ?, ?, ?)`
        )
        .bind(
          crypto.randomUUID(),
          acceptedOffer.buyer_id,
          `Sold: ${listing.title}`,
          'The seller marked your reserved item as sold.',
          `/listings/${listing.slug}`
        )
    );
  }

  if (acceptedOffer && listing.status === 'reserved' && status === 'active') {
    statements.push(
      db
        .prepare(
          `UPDATE offers
           SET status = 'cancelled',
               cancelled_at = datetime('now'),
               updated_at = datetime('now')
           WHERE id = ?
             AND status = 'accepted'`
        )
        .bind(acceptedOffer.id),
      db
        .prepare(
          `INSERT INTO notifications
             (id, user_id, type, title, body, href)
           VALUES (?, ?, 'listing', ?, ?, ?)`
        )
        .bind(
          crypto.randomUUID(),
          acceptedOffer.buyer_id,
          `Reservation released: ${listing.title}`,
          'The seller made the reserved item available again.',
          `/listings/${listing.slug}`
        )
    );
  }

  await db.batch(statements);

  await audit(db, locals.user.id, `listing.${status}`, 'listing', params.id, locals.requestId);

  return json({ status });
};
