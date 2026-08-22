import { brand } from '$lib/config';

export const GET = async ({ platform }) => {
  const base = (platform?.env.PUBLIC_APP_URL || brand.defaultUrl).replace(/\/$/, '');
  const staticUrls = ['/', '/search', '/legal/privacy', '/legal/terms'];
  const dynamic: { path: string; updated: string }[] = [];
  if (platform?.env.DB) {
    const [listings, sellers] = await Promise.all([
      platform.env.DB.prepare(
        "SELECT slug, updated_at FROM listings WHERE status = 'active' ORDER BY updated_at DESC LIMIT 10000"
      ).all<{ slug: string; updated_at: string }>(),
      platform.env.DB.prepare(
        "SELECT DISTINCT p.handle, p.updated_at FROM profiles p JOIN listings l ON l.seller_id = p.user_id WHERE l.status = 'active' LIMIT 5000"
      ).all<{ handle: string; updated_at: string }>()
    ]);
    dynamic.push(
      ...listings.results.map((row) => ({
        path: `/listings/${row.slug}`,
        updated: row.updated_at
      })),
      ...sellers.results.map((row) => ({ path: `/sellers/${row.handle}`, updated: row.updated_at }))
    );
  }
  const urls = [
    ...staticUrls.map((path) => `<url><loc>${base}${path}</loc></url>`),
    ...dynamic.map(
      (item) =>
        `<url><loc>${base}${item.path}</loc><lastmod>${new Date(item.updated).toISOString()}</lastmod></url>`
    )
  ].join('');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    }
  );
};
