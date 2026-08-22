import { redirect } from '@sveltejs/kit';
import { requireDb } from '$server/db';
import { plain } from '$lib/server/db';

export const load = async ({ platform, locals }) => {
  if (!locals.user) redirect(303, '/auth/login?returnTo=/messages');
  const result = await requireDb(platform)
    .prepare(
      `
    SELECT c.id, c.last_message_at, l.title, l.price_cents, l.slug,
      CASE WHEN c.buyer_id = ? THEN seller.display_name ELSE buyer.display_name END AS other_name,
      CASE WHEN c.buyer_id = ? THEN seller.handle ELSE buyer.handle END AS other_handle,
      (SELECT content FROM messages WHERE conversation_id = c.id AND removed_at IS NULL ORDER BY created_at DESC LIMIT 1) AS last_message,
      (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.sender_id <> ? AND m.read_at IS NULL) AS unread_count
    FROM conversations c JOIN listings l ON l.id = c.listing_id
    JOIN profiles seller ON seller.user_id = c.seller_id JOIN profiles buyer ON buyer.user_id = c.buyer_id
    JOIN conversation_members cm ON cm.conversation_id = c.id AND cm.user_id = ? AND cm.left_at IS NULL
    ORDER BY COALESCE(c.last_message_at, c.created_at) DESC
  `
    )
    .bind(locals.user.id, locals.user.id, locals.user.id, locals.user.id)
    .all();
  return plain({ conversations: result.results });
};
