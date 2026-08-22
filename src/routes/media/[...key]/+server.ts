import { error } from '@sveltejs/kit';
import { requireDb } from '$server/db';

export const GET = async ({ params, platform, locals, request }) => {
  const env = platform?.env;
  if (!env?.MEDIA) error(404, 'Image not found');
  const db = requireDb(platform);
  const allowed = await db
    .prepare(
      "SELECT 1 FROM listing_images li JOIN listings l ON l.id = li.listing_id WHERE li.object_key = ? AND (l.status IN ('active','reserved','sold') OR l.seller_id = ?)"
    )
    .bind(params.key, locals.user?.id || '')
    .first();
  if (!allowed) error(404, 'Image not found');
  const object = await env.MEDIA.get(params.key, { range: request.headers });
  if (!object) error(404, 'Image not found');
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  return new Response(object.body, { headers });
};
