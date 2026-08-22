import { fail, redirect } from '@sveltejs/kit';
import { categories, requireDb } from '$server/db';
import { slugify } from '$lib/utils';
import { plain } from '$lib/server/db';

export const load = async ({ platform, locals }) => {
  if (!locals.user) redirect(303, '/auth/login?returnTo=/sell');
  return plain({ categories: await categories(requireDb(platform)) });
};

export const actions = {
  default: async ({ request, platform, locals }) => {
    if (!locals.user) redirect(303, '/auth/login?returnTo=/sell');
    const form = await request.formData();
    const title = String(form.get('title') || '').trim();
    const categoryId = String(form.get('categoryId') || '');
    if (title.length < 4 || title.length > 100 || !categoryId)
      return fail(400, { message: 'Add a clear title and choose a category.', title, categoryId });
    const db = requireDb(platform);
    if (
      !(await db
        .prepare('SELECT 1 FROM categories WHERE id = ? AND is_active = 1')
        .bind(categoryId)
        .first())
    )
      return fail(400, { message: 'Choose a valid category.' });
    const profile = await db
      .prepare('SELECT locality, region FROM profiles WHERE user_id = ?')
      .bind(locals.user.id)
      .first<{ locality: string; region: string }>();

    if (!profile)
      return fail(409, {
        message: 'Complete your seller profile before creating a listing.',
        title,
        categoryId
      });

    const id = crypto.randomUUID();
    const slug = `${slugify(title)}-${id.slice(0, 8)}`;
    const result = await db
      .prepare(
        `INSERT INTO listings (
          id,
          seller_id,
          category_id,
          slug,
          title,
          description,
          condition,
          price_cents,
          locality,
          region,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, 'good', 0, ?, ?, 'draft')`
      )
      .bind(
        id,
        locals.user.id,
        categoryId,
        slug,
        title,
        'Add an honest, useful description before publishing.',
        profile.locality,
        profile.region
      )
      .run();

    if (!result.success || result.meta.changes !== 1)
      return fail(500, {
        message: 'The listing draft could not be created. Please try again.',
        title,
        categoryId
      });

    redirect(303, `/sell/${id}`);
  }
};
