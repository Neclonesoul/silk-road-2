import { fail, redirect } from '@sveltejs/kit';
import { reportSchema } from '$server/validation';
import { audit, requireDb } from '$server/db';
import { allowRequest } from '$server/rate-limit';

export const load = ({ url, locals }) => {
  if (!locals.user)
    redirect(303, `/auth/login?returnTo=${encodeURIComponent(url.pathname + url.search)}`);
  const type = url.searchParams.get('type');
  const id = url.searchParams.get('id');
  if (!['listing', 'user', 'message'].includes(type || '') || !id) redirect(303, '/');
  return { targetType: type, targetId: id };
};
export const actions = {
  default: async ({ request, platform, locals }) => {
    if (!locals.user) redirect(303, '/auth/login');
    const parsed = reportSchema.safeParse(Object.fromEntries(await request.formData()));
    if (!parsed.success) return fail(400, { message: 'Choose a reason and check the details.' });
    const db = requireDb(platform);
    if (!(await allowRequest(db, 'report-create', locals.user.id, 10, 3600)))
      return fail(429, { message: 'Report limit reached. Try again later.' });
    const id = crypto.randomUUID();
    await db
      .prepare(
        'INSERT INTO reports (id, reporter_id, target_type, target_id, reason, detail) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .bind(
        id,
        locals.user.id,
        parsed.data.targetType,
        parsed.data.targetId,
        parsed.data.reason,
        parsed.data.detail
      )
      .run();
    await audit(db, locals.user.id, 'report.create', 'report', id, locals.requestId);
    return { success: true };
  }
};
