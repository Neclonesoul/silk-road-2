import { categories, listings } from '$server/db';
import { searchSchema } from '$server/validation';
import { plain } from '$lib/server/db';

export const load = async ({ url, platform, locals }) => {
  if (!platform?.env.DB) return { categories: [], results: [], filters: {}, setup: true };
  const raw = Object.fromEntries(url.searchParams);
  const parsed = searchSchema.safeParse(raw);
  const filters = parsed.success ? parsed.data : { sort: 'newest' as const, page: 1 };
  const [allCategories, results] = await Promise.all([
    categories(platform.env.DB),
    listings(
      platform.env.DB,
      {
        ...filters,
        minPrice: filters.minPrice === undefined ? undefined : filters.minPrice * 100,
        maxPrice: filters.maxPrice === undefined ? undefined : filters.maxPrice * 100
      },
      locals.user?.id
    )
  ]);
  return plain({ categories: allCategories, results, filters, setup: false });
};
