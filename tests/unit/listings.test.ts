import { describe, expect, it } from 'vitest';
import { canEditListing, canTransitionListing } from '$lib/domain/listings';
import { buildListingSearch } from '$server/db';

describe('listing authorization and lifecycle', () => {
  it('allows only the owner to edit a mutable listing', () => {
    expect(canEditListing('seller', 'seller', 'active')).toBe(true);
    expect(canEditListing('seller', 'attacker', 'active')).toBe(false);
    expect(canEditListing('seller', 'seller', 'sold')).toBe(false);
  });
  it('allows explicit lifecycle transitions only', () => {
    expect(canTransitionListing('active', 'reserved')).toBe(true);
    expect(canTransitionListing('reserved', 'sold')).toBe(true);
    expect(canTransitionListing('sold', 'active')).toBe(false);
    expect(canTransitionListing('removed', 'active')).toBe(false);
  });
  it('keeps search input out of SQL text', () => {
    const attack = "%' OR 1=1 --";
    const query = buildListingSearch({ q: attack, sort: 'newest', page: 1 });
    expect(query.sql).not.toContain(attack);
    expect(query.bind).toContain(`%\\%' OR 1=1 --%`);
  });
  it('only chooses bounded sort clauses', () => {
    expect(buildListingSearch({ sort: 'price-asc' }).sql).toContain('l.price_cents ASC');
    expect(buildListingSearch({ sort: 'price-desc' }).sql).toContain('l.price_cents DESC');
  });
});
