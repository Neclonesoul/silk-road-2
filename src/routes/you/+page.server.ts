import { redirect } from '@sveltejs/kit';
import { requireDb } from '$server/db';

export const load = async ({ platform, locals }) => {
  if (!locals.user) redirect(303, '/auth/login?returnTo=/you');
  const db = requireDb(platform);
  const [profile, listingCounts, unread] = await Promise.all([
    db
      .prepare(
        'SELECT p.*, u.created_at, u.email_verified FROM profiles p JOIN users u ON u.id = p.user_id WHERE p.user_id = ?'
      )
      .bind(locals.user.id)
      .first(),
    db
      .prepare('SELECT status, COUNT(*) AS count FROM listings WHERE seller_id = ? GROUP BY status')
      .bind(locals.user.id)
      .all(),
    db
      .prepare('SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND read_at IS NULL')
      .bind(locals.user.id)
      .first()
  ]);
  return { profile, listingCounts: listingCounts.results, unread };
};

export const actions = {
  profile: async ({ request, platform, locals }) => {
    if (!locals.user) redirect(303, '/auth/login?returnTo=/you');
    const form = await request.formData();
    const displayName = String(form.get('displayName') || '').trim();
    const bio = String(form.get('bio') || '').trim();
    const locality = String(form.get('locality') || '').trim();
    const region = String(form.get('region') || '').trim();
    if (
      displayName.length < 2 ||
      displayName.length > 60 ||
      bio.length > 500 ||
      locality.length > 80 ||
      region.length > 80
    )
      return { success: false, message: 'Check the profile details and try again.' };
    await requireDb(platform)
      .prepare(
        "UPDATE profiles SET display_name = ?, bio = ?, locality = ?, region = ?, updated_at = datetime('now') WHERE user_id = ?"
      )
      .bind(displayName, bio, locality, region, locals.user.id)
      .run();
    return { success: true };
  }
};
