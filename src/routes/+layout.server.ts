import { brand } from '$lib/config';

export const load = async ({ locals, platform }) => {
  let unreadMessages = 0;

  if (locals.user && platform?.env.DB) {
    const unread = await platform.env.DB.prepare(
      `SELECT COUNT(*) AS count
         FROM messages m
         JOIN conversation_members cm
           ON cm.conversation_id = m.conversation_id
          AND cm.user_id = ?
          AND cm.left_at IS NULL
         WHERE m.sender_id <> ?
           AND m.read_at IS NULL
           AND m.removed_at IS NULL`
    )
      .bind(locals.user.id, locals.user.id)
      .first<{ count: number }>();

    unreadMessages = Number(unread?.count || 0);
  }

  return {
    user: locals.user
      ? {
          id: locals.user.id,
          email: locals.user.email,
          role: locals.user.role,
          emailVerified: locals.user.emailVerified,
          handle: locals.user.handle,
          displayName: locals.user.displayName,
          avatarKey: locals.user.avatarKey
        }
      : null,

    unreadMessages,

    config: {
      name: platform?.env.PUBLIC_APP_NAME || brand.name,
      shortName: platform?.env.PUBLIC_APP_SHORT_NAME || brand.shortName,
      proposition: platform?.env.PUBLIC_APP_DESCRIPTION || brand.proposition,
      description: platform?.env.PUBLIC_APP_DESCRIPTION || brand.description,
      url: platform?.env.PUBLIC_APP_URL || brand.defaultUrl,
      supportEmail: platform?.env.PUBLIC_SUPPORT_EMAIL || brand.supportEmail,
      turnstileSiteKey: platform?.env.PUBLIC_TURNSTILE_SITE_KEY || ''
    }
  };
};
