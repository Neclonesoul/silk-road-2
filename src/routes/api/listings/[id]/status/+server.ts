import { error, json } from '@sveltejs/kit';
import { audit, requireDb } from '$server/db';
import { canTransitionListing } from '$lib/domain/listings';
import type { ListingStatus } from '$lib/types';

export const PATCH = async ({ request, params, platform, locals }) => {
  if (!locals.user) error(401, 'Sign in required');
  const { status } = (await request.json()) as { status: string };
  if (!['active', 'reserved', 'sold', 'removed'].includes(status))
    error(400, 'Invalid listing state');
  const db = requireDb(platform);
  const listing = await db
    .prepare("SELECT status FROM listings WHERE id = ? AND seller_id = ? AND status <> 'removed'")
    .bind(params.id, locals.user.id)
    .first<{ status: string }>();
  if (!listing) error(404, 'Listing not found');
  if (!canTransitionListing(listing.status as ListingStatus, status as ListingStatus))
    error(409, `Cannot change ${listing.status} to ${status}`);
  await db
    .prepare(
      "UPDATE listings SET status = ?, sold_at = CASE WHEN ? = 'sold' THEN datetime('now') ELSE sold_at END, updated_at = datetime('now') WHERE id = ? AND seller_id = ?"
    )
    .bind(status, status, params.id, locals.user.id)
    .run();
  await audit(db, locals.user.id, `listing.${status}`, 'listing', params.id, locals.requestId);
  return json({ status });
};
