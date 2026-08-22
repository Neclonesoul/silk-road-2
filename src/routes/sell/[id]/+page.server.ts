import { error, fail, redirect } from '@sveltejs/kit';
import { requireDb, audit } from '$server/db';
import { listingSchema, firstIssue } from '$server/validation';
import { toCents } from '$lib/utils';
import { plain } from '$lib/server/db';

async function ownedDraft(db: D1Database, id: string, userId: string) {
  return db
    .prepare(
      "SELECT * FROM listings WHERE id = ? AND seller_id = ? AND status IN ('draft','active','reserved')"
    )
    .bind(id, userId)
    .first<Record<string, unknown>>();
}

export const load = async ({ params, platform, locals }) => {
  if (!locals.user) redirect(303, `/auth/login?returnTo=/sell/${params.id}`);
  const db = requireDb(platform);
  const listing = await ownedDraft(db, params.id, locals.user.id);
  if (!listing) error(404, 'Listing not found');
  const [categoryList, attributes, images] = await Promise.all([
    db.prepare('SELECT id, name FROM categories WHERE is_active = 1 ORDER BY sort_order').all(),
    db
      .prepare('SELECT * FROM category_attributes WHERE category_id = ? ORDER BY sort_order')
      .bind(listing.category_id)
      .all(),
    db
      .prepare(
        'SELECT * FROM listing_images WHERE listing_id = ? ORDER BY is_cover DESC, sort_order'
      )
      .bind(params.id)
      .all()
  ]);
  return plain({
    listing,
    categories: categoryList.results,
    attributes: attributes.results,
    images: images.results
  });
};

export const actions = {
  save: async ({ request, params, platform, locals }) => {
    if (!locals.user) redirect(303, `/auth/login?returnTo=/sell/${params.id}`);
    const db = requireDb(platform);
    if (!(await ownedDraft(db, params.id, locals.user.id)))
      return fail(404, { message: 'Listing not found.' });
    const form = await request.formData();
    const rawAttributes = String(form.get('attributes') || '{}');
    let attributes: Record<string, string | number | boolean> = {};
    try {
      attributes = JSON.parse(rawAttributes);
    } catch {
      return fail(400, { message: 'One of the category details is invalid.' });
    }
    const parsed = listingSchema.safeParse({
      title: form.get('title'),
      description: form.get('description'),
      categoryId: form.get('categoryId'),
      condition: form.get('condition'),
      priceCents: toCents(String(form.get('price') || '')),
      priceNegotiable: form.get('priceNegotiable') === 'on',
      locality: form.get('locality'),
      region: form.get('region'),
      attributes
    });
    if (!parsed.success) return fail(400, { message: firstIssue(parsed.error) });
    const attributeDefs = await db
      .prepare(
        'SELECT id, attribute_key, field_type, required, options_json, min_number, max_number FROM category_attributes WHERE category_id = ?'
      )
      .bind(parsed.data.categoryId)
      .all<any>();
    const statements = [
      db
        .prepare(
          "UPDATE listings SET category_id = ?, title = ?, description = ?, condition = ?, price_cents = ?, price_negotiable = ?, locality = ?, region = ?, updated_at = datetime('now') WHERE id = ? AND seller_id = ?"
        )
        .bind(
          parsed.data.categoryId,
          parsed.data.title,
          parsed.data.description,
          parsed.data.condition,
          parsed.data.priceCents,
          parsed.data.priceNegotiable ? 1 : 0,
          parsed.data.locality,
          parsed.data.region,
          params.id,
          locals.user.id
        ),
      db.prepare('DELETE FROM listing_attributes WHERE listing_id = ?').bind(params.id)
    ];
    for (const definition of attributeDefs.results) {
      const value = parsed.data.attributes[definition.attribute_key];
      if ((value === undefined || value === '') && definition.required)
        return fail(400, {
          message: `${definition.attribute_key.replaceAll('_', ' ')} is required.`
        });
      if (value === undefined || value === '') continue;
      const text =
        definition.field_type === 'text' || definition.field_type === 'select'
          ? String(value)
          : null;
      const number = definition.field_type === 'number' ? Number(value) : null;
      const boolean = definition.field_type === 'boolean' ? (value ? 1 : 0) : null;
      statements.push(
        db
          .prepare(
            'INSERT INTO listing_attributes (listing_id, attribute_id, value_text, value_number, value_boolean) VALUES (?, ?, ?, ?, ?)'
          )
          .bind(params.id, definition.id, text, number, boolean)
      );
    }
    await db.batch(statements);
    return { saved: true };
  },
  publish: async ({ params, platform, locals }) => {
    if (!locals.user) redirect(303, `/auth/login?returnTo=/sell/${params.id}`);
    const db = requireDb(platform);
    const listing = await ownedDraft(db, params.id, locals.user.id);
    if (!listing) return fail(404, { message: 'Listing not found.' });
    const images = await db
      .prepare('SELECT COUNT(*) AS count FROM listing_images WHERE listing_id = ?')
      .bind(params.id)
      .first<{ count: number }>();
    if (!images?.count)
      return fail(400, { message: 'Add at least one photograph before publishing.' });
    if (String(listing.description).length < 20 || Number(listing.price_cents) < 0)
      return fail(400, { message: 'Save the required listing details before publishing.' });
    await db
      .prepare(
        "UPDATE listings SET status = 'active', published_at = COALESCE(published_at, datetime('now')), expires_at = datetime('now', '+90 days'), updated_at = datetime('now') WHERE id = ? AND seller_id = ?"
      )
      .bind(params.id, locals.user.id)
      .run();
    await audit(db, locals.user.id, 'listing.publish', 'listing', params.id, locals.requestId);
    redirect(303, `/listings/${listing.slug}`);
  }
};
