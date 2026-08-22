import type { ListingStatus } from '$lib/types';

const transitions: Record<ListingStatus, readonly ListingStatus[]> = {
  draft: ['active', 'removed'],
  active: ['reserved', 'sold', 'removed'],
  reserved: ['active', 'sold', 'removed'],
  sold: [],
  expired: ['active', 'removed'],
  removed: []
};

export function canTransitionListing(from: ListingStatus, to: ListingStatus): boolean {
  return transitions[from].includes(to);
}

export function canEditListing(sellerId: string, actorId: string, status: ListingStatus): boolean {
  return sellerId === actorId && status !== 'removed' && status !== 'sold';
}
