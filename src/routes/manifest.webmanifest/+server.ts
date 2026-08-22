import { json } from '@sveltejs/kit';
import { brand } from '$lib/config';

export const GET = ({ platform }) =>
  json(
    {
      name: platform?.env.PUBLIC_APP_NAME || brand.name,
      short_name: platform?.env.PUBLIC_APP_SHORT_NAME || brand.shortName,
      description: platform?.env.PUBLIC_APP_DESCRIPTION || brand.proposition,
      start_url: '/',
      display: 'standalone',
      background_color: '#F7F5F0',
      theme_color: '#171714',
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        {
          src: '/icons/icon-maskable-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ]
    },
    { headers: { 'Cache-Control': 'public, max-age=3600' } }
  );
