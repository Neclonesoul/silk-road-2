import { brand } from '$lib/config';

export const load = async ({ locals, platform }) => ({
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
  config: {
    name: platform?.env.PUBLIC_APP_NAME || brand.name,
    shortName: platform?.env.PUBLIC_APP_SHORT_NAME || brand.shortName,
    proposition: platform?.env.PUBLIC_APP_DESCRIPTION || brand.proposition,
    description: platform?.env.PUBLIC_APP_DESCRIPTION || brand.description,
    url: platform?.env.PUBLIC_APP_URL || brand.defaultUrl,
    supportEmail: platform?.env.PUBLIC_SUPPORT_EMAIL || brand.supportEmail,
    turnstileSiteKey: platform?.env.PUBLIC_TURNSTILE_SITE_KEY || ''
  }
});
