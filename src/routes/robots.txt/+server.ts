import { brand } from '$lib/config';
export const GET = ({ platform }) => {
  const base = (platform?.env.PUBLIC_APP_URL || brand.defaultUrl).replace(/\/$/, '');
  return new Response(
    `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /auth\nDisallow: /messages\nDisallow: /notifications\nDisallow: /sell\nDisallow: /you\nSitemap: ${base}/sitemap.xml\n`,
    {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400'
      }
    }
  );
};
