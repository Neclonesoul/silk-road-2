import { describe, expect, it } from 'vitest';
import { listingSchema, loginSchema, reportSchema, signupSchema } from '$server/validation';

describe('hostile input boundaries', () => {
  it('requires a strong signup password and a constrained handle', () => {
    expect(
      signupSchema.safeParse({
        email: 'seller@example.test',
        displayName: 'Seller',
        handle: '../admin',
        password: 'weak',
        locality: 'Alton',
        region: 'KwaZulu-Natal'
      }).success
    ).toBe(false);
    expect(
      signupSchema.safeParse({
        email: 'seller@example.test',
        displayName: 'Seller',
        handle: 'seller-one',
        password: 'Correct-Horse-9',
        locality: 'Alton',
        region: 'KwaZulu-Natal'
      }).success
    ).toBe(true);
  });
  it('normalizes login email', () =>
    expect(loginSchema.parse({ email: ' Person@Example.Test ', password: 'x' }).email).toBe(
      'person@example.test'
    ));
  it('bounds price and listing text', () =>
    expect(
      listingSchema.safeParse({
        title: 'Phone',
        description: 'Too short',
        categoryId: 'phones-tablets',
        condition: 'good',
        priceCents: -1,
        priceNegotiable: false,
        locality: 'Richards Bay',
        region: 'KZN',
        attributes: {}
      }).success
    ).toBe(false));
  it('only accepts documented report categories', () =>
    expect(
      reportSchema.safeParse({
        targetType: 'listing',
        targetId: '1',
        reason: 'revenge',
        detail: ''
      }).success
    ).toBe(false));
});
