import { fail, redirect } from '@sveltejs/kit';
import { categories, requireDb } from '$server/db';
import { slugify } from '$lib/utils';

export const load = async ({ platform, locals }) => {
  if (!locals.user) redirect(303, '/auth/login?returnTo=/sell');
  return { categories: await categories(requireDb(platform)) };
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
    const id = crypto.randomUUID();
    const slug = `${slugify(title)}-${id.slice(0, 8)}`;
    await db
      .prepare(
        "INSERT INTO listings (id, seller_id, category_id, slug, title, description, condition, price_cents, locality, region, status) SELECT ?, ?, ?, ?, ?, ?, 'good', 0, locality, region, 'draft' FROM profiles WHERE user_id = ?"
      )
      .bind(
        id,
        locals.user.id,
        categoryId,
        slug,
        title,
        'Add an honest, useful description before publishing.',
        locals.user.id
      )
      .run();
    redirect(303, `/sell/${id}`);
  }
};
