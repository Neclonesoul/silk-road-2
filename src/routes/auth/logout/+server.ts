import { redirect } from '@sveltejs/kit';
import { destroySession } from '$server/auth';

export const POST = async ({ platform, cookies }) => {
  if (platform?.env.DB) await destroySession(platform.env.DB, cookies, platform.env);
  redirect(303, '/');
};
