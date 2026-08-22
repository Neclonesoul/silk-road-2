import { error, json } from '@sveltejs/kit';
import { requireDb, audit } from '$server/db';
import { reportSchema } from '$server/validation';
import { allowRequest } from '$server/rate-limit';

export const POST = async ({ request, platform, locals }) => {
  if (!locals.user) error(401, 'Sign in required');
  const parsed = reportSchema.safeParse(await request.json());
  if (!parsed.success) error(400, 'Invalid report');
  const db = requireDb(platform);
  if (!(await allowRequest(db, 'report-create', locals.user.id, 10, 3600)))
    error(429, 'Report limit reached. Try again later.');
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
  await audit(db, locals.user.id, 'report.create', 'report', id, locals.requestId, {
    targetType: parsed.data.targetType
  });
  return json({ id }, { status: 201 });
};
