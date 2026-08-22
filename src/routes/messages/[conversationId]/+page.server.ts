import { error, fail, redirect } from '@sveltejs/kit';
import { canAccessConversation, requireDb } from '$server/db';
import { messageSchema } from '$server/validation';
import { allowRequest } from '$server/rate-limit';
import { plain } from '$lib/server/db';

export const load = async ({ params, platform, locals }) => {
  if (!locals.user) redirect(303, `/auth/login?returnTo=/messages/${params.conversationId}`);
  const db = requireDb(platform);
  if (!(await canAccessConversation(db, params.conversationId, locals.user.id)))
    error(404, 'Conversation not found');
  const conversation = await db
    .prepare(
      `SELECT c.*, l.title, l.price_cents, l.slug, l.status AS listing_status, seller.display_name AS seller_name, seller.handle AS seller_handle, buyer.display_name AS buyer_name, buyer.handle AS buyer_handle FROM conversations c JOIN listings l ON l.id = c.listing_id JOIN profiles seller ON seller.user_id = c.seller_id JOIN profiles buyer ON buyer.user_id = c.buyer_id WHERE c.id = ?`
    )
    .bind(params.conversationId)
    .first();
  const messages = await db
    .prepare(
      'SELECT m.id, m.sender_id, m.content, m.delivered_at, m.read_at, m.created_at, p.display_name AS sender_name FROM messages m JOIN profiles p ON p.user_id = m.sender_id WHERE m.conversation_id = ? AND m.removed_at IS NULL ORDER BY m.created_at ASC LIMIT 200'
    )
    .bind(params.conversationId)
    .all();
  await db
    .prepare(
      "UPDATE messages SET read_at = COALESCE(read_at, datetime('now')) WHERE conversation_id = ? AND sender_id <> ?"
    )
    .bind(params.conversationId, locals.user.id)
    .run();
  return plain({ conversation, messages: messages.results });
};

export const actions = {
  send: async ({ request, params, platform, locals }) => {
    if (!locals.user) redirect(303, `/auth/login?returnTo=/messages/${params.conversationId}`);
    const db = requireDb(platform);
    if (!(await allowRequest(db, 'message-send', locals.user.id, 120, 60)))
      return fail(429, { message: 'You are sending messages too quickly.' });
    if (!(await canAccessConversation(db, params.conversationId, locals.user.id)))
      return fail(403, { message: 'Conversation access denied.' });
    const parsed = messageSchema.safeParse(Object.fromEntries(await request.formData()));
    if (!parsed.success) return fail(400, { message: 'Write a message up to 2,000 characters.' });
    const conversation = await db
      .prepare('SELECT buyer_id, seller_id FROM conversations WHERE id = ?')
      .bind(params.conversationId)
      .first<{ buyer_id: string; seller_id: string }>();
    if (!conversation) return fail(404, { message: 'Conversation not found.' });
    const recipientId =
      conversation.buyer_id === locals.user.id ? conversation.seller_id : conversation.buyer_id;
    const blocked = await db
      .prepare(
        'SELECT 1 FROM blocks WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)'
      )
      .bind(locals.user.id, recipientId, recipientId, locals.user.id)
      .first();
    if (blocked) return fail(403, { message: 'Messaging is unavailable.' });
    const id = crypto.randomUUID();
    await db.batch([
      db
        .prepare(
          'INSERT INTO messages (id, conversation_id, sender_id, content) VALUES (?, ?, ?, ?)'
        )
        .bind(id, params.conversationId, locals.user.id, parsed.data.content),
      db
        .prepare("UPDATE conversations SET last_message_at = datetime('now') WHERE id = ?")
        .bind(params.conversationId),
      db
        .prepare(
          "INSERT INTO notifications (id, user_id, type, title, body, href) VALUES (?, ?, 'message', ?, ?, ?)"
        )
        .bind(
          crypto.randomUUID(),
          recipientId,
          `Message from ${locals.user.displayName}`,
          parsed.data.content.slice(0, 160),
          `/messages/${params.conversationId}`
        )
    ]);
    const env = platform?.env;
    if (env?.CHAT_ROOMS) {
      const stub = env.CHAT_ROOMS.get(env.CHAT_ROOMS.idFromName(params.conversationId));
      platform?.context.waitUntil(
        stub.fetch('https://chat.internal/broadcast', {
          method: 'POST',
          body: JSON.stringify({
            type: 'message',
            id,
            senderId: locals.user.id,
            content: parsed.data.content,
            createdAt: new Date().toISOString()
          })
        })
      );
    }
    return { sent: true };
  }
};
