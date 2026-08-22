export type ListingStatus = 'draft' | 'active' | 'reserved' | 'sold' | 'expired' | 'removed';
export type Condition = 'new' | 'like-new' | 'good' | 'fair' | 'parts';

export interface SessionUser {
  id: string;
  email: string;
  handle: string;
  displayName: string;
  avatarKey: string | null;
  role: 'user' | 'moderator' | 'admin';
  emailVerified: boolean;
}

export interface ListingCard {
  id: string;
  slug: string;
  title: string;
  priceCents: number;
  priceNegotiable: boolean;
  locality: string;
  region: string;
  condition: Condition;
  status: ListingStatus;
  publishedAt: string | null;
  coverKey: string | null;
  sellerHandle: string;
  sellerName: string;
  sellerVerified: boolean;
  isFavorite?: boolean;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string;
  listingCount?: number;
}

export interface SearchInput {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: Condition;
  location?: string;
  date?: 'day' | 'week' | 'month';
  sort?: 'newest' | 'price-asc' | 'price-desc';
  page?: number;
}
