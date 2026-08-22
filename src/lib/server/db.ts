import { error } from '@sveltejs/kit';
import { limits } from '$lib/config';
import type { Category, ListingCard, SearchInput, SessionUser } from '$lib/types';

export function requireDb(platform: App.Platform | undefined): D1Database {
  if (!platform?.env.DB) error(503, 'The marketplace database is not connected yet.');
  return platform.env.DB;
}

export async function categories(db: D1Database): Promise<Category[]> {
  const result = await db
    .prepare(
      `
    SELECT c.id, c.slug, c.name, c.icon,
      COUNT(CASE WHEN l.status = 'active' THEN 1 END) AS listingCount
    FROM categories c LEFT JOIN listings l ON l.category_id = c.id
    WHERE c.is_active = 1 GROUP BY c.id ORDER BY c.sort_order, c.name
  `
    )
    .all<Category>();
  return result.results;
}

export function buildListingSearch(input: SearchInput, viewerId?: string | null) {
  const where = ["l.status = 'active'", 'u.status = ?'];
  const values: unknown[] = ['active'];
  if (input.q) {
    where.push("(l.title LIKE ? ESCAPE '\\' OR l.description LIKE ? ESCAPE '\\')");
    const q = `%${input.q.replace(/[\\%_]/g, '\\$&')}%`;
    values.push(q, q);
  }
  if (input.category) {
    where.push('c.slug = ?');
    values.push(input.category);
  }
  if (input.minPrice !== undefined) {
    where.push('l.price_cents >= ?');
    values.push(input.minPrice);
  }
  if (input.maxPrice !== undefined) {
    where.push('l.price_cents <= ?');
    values.push(input.maxPrice);
  }
  if (input.condition) {
    where.push('l.condition = ?');
    values.push(input.condition);
  }
  if (input.location) {
    where.push('(l.locality LIKE ? OR l.region LIKE ?)');
    values.push(`%${input.location}%`, `%${input.location}%`);
  }
  if (input.date) {
    const days = input.date === 'day' ? 1 : input.date === 'week' ? 7 : 30;
    where.push(`l.published_at >= datetime('now', ?)`);
    values.push(`-${days} days`);
  }
  const sort =
    input.sort === 'price-asc'
      ? 'l.price_cents ASC, l.published_at DESC'
      : input.sort === 'price-desc'
        ? 'l.price_cents DESC, l.published_at DESC'
        : 'l.published_at DESC';
  const page = Math.max(1, input.page ?? 1);
  const favoriteJoin = viewerId
    ? 'LEFT JOIN favorites f ON f.listing_id = l.id AND f.user_id = ?'
    : '';
  const favoriteSelect = viewerId
    ? ', CASE WHEN f.user_id IS NULL THEN 0 ELSE 1 END AS isFavorite'
    : ', 0 AS isFavorite';
  const bind = viewerId
    ? [viewerId, ...values, limits.pageSize, (page - 1) * limits.pageSize]
    : [...values, limits.pageSize, (page - 1) * limits.pageSize];
  const sql = `
    SELECT l.id, l.slug, l.title, l.price_cents AS priceCents, l.price_negotiable AS priceNegotiable,
      l.locality, l.region, l.condition, l.status, l.published_at AS publishedAt,
      (SELECT object_key FROM listing_images WHERE listing_id = l.id ORDER BY is_cover DESC, sort_order LIMIT 1) AS coverKey,
      p.handle AS sellerHandle, p.display_name AS sellerName, u.email_verified AS sellerVerified ${favoriteSelect}
    FROM listings l JOIN users u ON u.id = l.seller_id JOIN profiles p ON p.user_id = u.id
    JOIN categories c ON c.id = l.category_id ${favoriteJoin}
    WHERE ${where.join(' AND ')} ORDER BY ${sort} LIMIT ? OFFSET ?`;
  return { sql, bind };
}

export async function listings(
  db: D1Database,
  input: SearchInput = {},
  viewerId?: string | null
): Promise<ListingCard[]> {
  const query = buildListingSearch(input, viewerId);
  const result = await db
    .prepare(query.sql)
    .bind(...query.bind)
    .all<ListingCard>();
  return result.results.map((row) => ({
    ...row,
    priceNegotiable: Boolean(row.priceNegotiable),
    sellerVerified: Boolean(row.sellerVerified),
    isFavorite: Boolean(row.isFavorite)
  }));
}

export async function listingBySlug(db: D1Database, slug: string, viewerId?: string | null) {
  const listing = await db
    .prepare(
      `
    SELECT l.*, c.name AS category_name, c.slug AS category_slug, p.handle AS seller_handle,
      p.display_name AS seller_name, p.bio AS seller_bio, p.avatar_key AS seller_avatar_key,
      p.locality AS seller_locality, p.region AS seller_region, u.created_at AS seller_since,
      u.email_verified AS seller_verified,
      CASE WHEN f.user_id IS NULL THEN 0 ELSE 1 END AS is_favorite
    FROM listings l JOIN categories c ON c.id = l.category_id JOIN users u ON u.id = l.seller_id
    JOIN profiles p ON p.user_id = u.id LEFT JOIN favorites f ON f.listing_id = l.id AND f.user_id = ?
    WHERE l.slug = ? AND (l.status IN ('active','reserved','sold') OR l.seller_id = ?)
  `
    )
    .bind(viewerId ?? '', slug, viewerId ?? '')
    .first<Record<string, unknown>>();
  if (!listing) return null;
  const [images, attributes] = await Promise.all([
    db
      .prepare(
        'SELECT id, object_key, alt_text, width, height, sort_order, is_cover FROM listing_images WHERE listing_id = ? ORDER BY is_cover DESC, sort_order'
      )
      .bind(listing.id)
      .all(),
    db
      .prepare(
        'SELECT ca.attribute_key, ca.label, la.value_text, la.value_number, la.value_boolean FROM listing_attributes la JOIN category_attributes ca ON ca.id = la.attribute_id WHERE la.listing_id = ? ORDER BY ca.sort_order'
      )
      .bind(listing.id)
      .all()
  ]);
  return { ...listing, images: images.results, attributes: attributes.results };
}

export async function sessionUser(db: D1Database, tokenHash: string): Promise<SessionUser | null> {
  const row = await db
    .prepare(
      `
    SELECT u.id, u.email, u.role, u.email_verified AS emailVerified, p.handle,
      p.display_name AS displayName, p.avatar_key AS avatarKey
    FROM sessions s JOIN users u ON u.id = s.user_id JOIN profiles p ON p.user_id = u.id
    WHERE s.token_hash = ? AND s.expires_at > datetime('now') AND u.status = 'active'
  `
    )
    .bind(tokenHash)
    .first<SessionUser>();
  return row ? { ...row, emailVerified: Boolean(row.emailVerified) } : null;
}

export async function audit(
  db: D1Database,
  actorId: string | null,
  action: string,
  targetType: string,
  targetId: string | null,
  requestId: string,
  metadata: Record<string, unknown> = {}
) {
  await db
    .prepare(
      'INSERT INTO audit_events (id, actor_id, action, target_type, target_id, request_id, metadata_json) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
    .bind(
      crypto.randomUUID(),
      actorId,
      action,
      targetType,
      targetId,
      requestId,
      JSON.stringify(metadata)
    )
    .run();
}

export async function canAccessConversation(
  db: D1Database,
  conversationId: string,
  userId: string
): Promise<boolean> {
  return Boolean(
    await db
      .prepare(
        'SELECT 1 FROM conversation_members WHERE conversation_id = ? AND user_id = ? AND left_at IS NULL'
      )
      .bind(conversationId, userId)
      .first()
  );
}
