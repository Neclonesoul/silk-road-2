import { categories, listings } from '$server/db';
import { plain } from '$lib/server/db';

export const load = async ({ platform, locals }) => {
  if (!platform?.env.DB) return { categories: [], fresh: [], featured: [], setup: true };
  const [allCategories, fresh] = await Promise.all([
    categories(platform.env.DB),
    listings(platform.env.DB, { sort: 'newest', page: 1 }, locals.user?.id)
  ]);
  return plain({
    categories: allCategories,
    fresh: fresh.slice(0, 12),
    featured: [],
    setup: false
  });
};
