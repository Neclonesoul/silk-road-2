import { json } from '@sveltejs/kit';
export const GET = async ({ platform }) => {
  let database = 'unconfigured';
  if (platform?.env.DB) {
    try {
      await platform.env.DB.prepare('SELECT 1').first();
      database = 'ok';
    } catch {
      database = 'error';
    }
  }
  return json(
    { status: database === 'error' ? 'degraded' : 'ok', database, version: '2.0.0' },
    { status: database === 'error' ? 503 : 200, headers: { 'Cache-Control': 'no-store' } }
  );
};
