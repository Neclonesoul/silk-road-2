import { error, json } from '@sveltejs/kit';
import { limits } from '$lib/config';
import { requireDb } from '$server/db';
import { allowRequest } from '$server/rate-limit';

function detectedImageType(bytes: Uint8Array): string | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes.slice(0, 8).every((byte, index) => byte === [137, 80, 78, 71, 13, 10, 26, 10][index]))
    return 'image/png';
  const header = new TextDecoder().decode(bytes.slice(0, 12));
  if (header.startsWith('RIFF') && header.endsWith('WEBP')) return 'image/webp';
  if (header.slice(4, 12).includes('ftypavif')) return 'image/avif';
  return null;
}

export const POST = async ({ request, params, platform, locals }) => {
  if (!locals.user) error(401, 'Sign in required');
  const env = platform?.env;
  if (!env?.MEDIA) error(503, 'Image storage is not configured');
  const db = requireDb(platform);
  if (!(await allowRequest(db, 'image-upload', locals.user.id, 60, 3600)))
    error(429, 'Upload limit reached. Try again later.');
  const owned = await db
    .prepare(
      "SELECT 1 FROM listings WHERE id = ? AND seller_id = ? AND status IN ('draft','active','reserved')"
    )
    .bind(params.id, locals.user.id)
    .first();
  if (!owned) error(404, 'Listing not found');
  const count = await db
    .prepare('SELECT COUNT(*) AS count FROM listing_images WHERE listing_id = ?')
    .bind(params.id)
    .first<{ count: number }>();
  if ((count?.count || 0) >= limits.images)
    error(400, `A listing can have up to ${limits.images} photographs.`);
  const form = await request.formData();
  const file = form.get('image');
  if (!(file instanceof File) || file.size <= 0 || file.size > limits.imageBytes)
    error(400, 'Choose an image smaller than 10 MB.');
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = detectedImageType(bytes);
  if (!type) error(415, 'Use a JPEG, PNG, WebP or AVIF image.');
  const id = crypto.randomUUID();
  const extension = type.split('/')[1].replace('jpeg', 'jpg');
  const key = `listings/${params.id}/${id}.${extension}`;
  await env.MEDIA.put(key, bytes, {
    httpMetadata: { contentType: type, cacheControl: 'public, max-age=31536000, immutable' },
    customMetadata: { ownerId: locals.user.id, listingId: params.id }
  });
  try {
    await db
      .prepare(
        'INSERT INTO listing_images (id, listing_id, object_key, content_type, bytes, sort_order, is_cover) VALUES (?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(id, params.id, key, type, bytes.byteLength, count?.count || 0, count?.count ? 0 : 1)
      .run();
  } catch (cause) {
    await env.MEDIA.delete(key);
    throw cause;
  }
  return json(
    {
      id,
      object_key: key,
      alt_text: '',
      sort_order: count?.count || 0,
      is_cover: count?.count ? 0 : 1,
      url: `/media/${key}`
    },
    { status: 201 }
  );
};

export const PATCH = async ({ request, params, platform, locals }) => {
  if (!locals.user) error(401, 'Sign in required');
  const db = requireDb(platform);
  const owned = await db
    .prepare('SELECT 1 FROM listings WHERE id = ? AND seller_id = ?')
    .bind(params.id, locals.user.id)
    .first();
  if (!owned) error(404, 'Listing not found');
  const payload = (await request.json()) as { order: string[]; coverId: string };
  if (
    !Array.isArray(payload.order) ||
    payload.order.length > limits.images ||
    !payload.order.includes(payload.coverId)
  )
    error(400, 'Invalid image order');
  const current = await db
    .prepare('SELECT id FROM listing_images WHERE listing_id = ?')
    .bind(params.id)
    .all<{ id: string }>();
  if (
    current.results.length !== payload.order.length ||
    current.results.some((row) => !payload.order.includes(row.id))
  )
    error(400, 'Image set mismatch');
  const statements = [
    db.prepare('UPDATE listing_images SET is_cover = 0 WHERE listing_id = ?').bind(params.id),
    ...payload.order.map((id, index) =>
      db
        .prepare(
          'UPDATE listing_images SET sort_order = ?, is_cover = ? WHERE id = ? AND listing_id = ?'
        )
        .bind(index, id === payload.coverId ? 1 : 0, id, params.id)
    )
  ];
  await db.batch(statements);
  return json({ ok: true });
};
