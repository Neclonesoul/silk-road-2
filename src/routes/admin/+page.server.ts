import { error, fail } from '@sveltejs/kit';
import { isAdmin } from '$server/auth';
import { audit, requireDb } from '$server/db';

export const load = async ({ platform, locals }) => {
  if (!locals.user) error(401, 'Sign in required');
  if (!isAdmin(locals.user)) error(403, 'Administrator access required');
  const db = requireDb(platform);
  const [counts, reports, listings, users] = await Promise.all([
    db
      .prepare(
        "SELECT (SELECT COUNT(*) FROM users WHERE status = 'active') AS users, (SELECT COUNT(*) FROM listings WHERE status = 'active') AS listings, (SELECT COUNT(*) FROM reports WHERE status IN ('open','reviewing')) AS open_reports"
      )
      .first(),
    db
      .prepare(
        "SELECT r.*, p.handle AS reporter_handle FROM reports r JOIN profiles p ON p.user_id = r.reporter_id WHERE r.status IN ('open','reviewing') ORDER BY r.created_at ASC LIMIT 100"
      )
      .all(),
    db
      .prepare(
        "SELECT l.id, l.slug, l.title, l.status, l.moderation_reason, p.handle FROM listings l JOIN profiles p ON p.user_id = l.seller_id WHERE l.status = 'removed' ORDER BY l.updated_at DESC LIMIT 50"
      )
      .all(),
    db
      .prepare(
        'SELECT u.id, u.email, u.role, u.status, u.created_at, p.handle, p.display_name FROM users u JOIN profiles p ON p.user_id = u.id ORDER BY u.created_at DESC LIMIT 100'
      )
      .all()
  ]);
  return {
    counts,
    reports: reports.results,
    removedListings: listings.results,
    users: users.results
  };
};

export const actions = {
  moderate: async ({ request, platform, locals }) => {
    if (!locals.user || !isAdmin(locals.user)) error(403, 'Administrator access required');
    const form = await request.formData();
    const reportId = String(form.get('reportId') || '');
    const resolution = String(form.get('resolution') || '');
    const note = String(form.get('note') || '').trim();
    if (!['resolved', 'dismissed'].includes(resolution) || note.length > 1000)
      return fail(400, { message: 'Choose a valid resolution.' });
    const db = requireDb(platform);
    await db
      .prepare(
        "UPDATE reports SET status = ?, resolution_note = ?, resolved_by = ?, resolved_at = datetime('now') WHERE id = ? AND status IN ('open','reviewing')"
      )
      .bind(resolution, note, locals.user.id, reportId)
      .run();
    await audit(db, locals.user.id, `report.${resolution}`, 'report', reportId, locals.requestId);
    return { success: true };
  },
  removeListing: async ({ request, platform, locals }) => {
    if (!locals.user || !isAdmin(locals.user)) error(403, 'Administrator access required');
    const form = await request.formData();
    const listingId = String(form.get('listingId') || '');
    const reason = String(form.get('reason') || '').trim();
    if (reason.length < 5 || reason.length > 500)
      return fail(400, { message: 'Provide a concise moderation reason.' });
    const db = requireDb(platform);
    await db
      .prepare(
        "UPDATE listings SET status = 'removed', moderation_reason = ?, updated_at = datetime('now') WHERE id = ?"
      )
      .bind(reason, listingId)
      .run();
    await audit(
      db,
      locals.user.id,
      'listing.moderation_remove',
      'listing',
      listingId,
      locals.requestId,
      { reason }
    );
    return { success: true };
  }
};
