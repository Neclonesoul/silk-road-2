import { describe, expect, it } from 'vitest';
import { formatMoney, relativeTime, safeReturnTo, slugify, toCents } from '$lib/utils';

describe('marketplace value transformations', () => {
  it('creates stable human slugs', () =>
    expect(slugify('  Makita Drill & 2 Batteries ')).toBe('makita-drill-2-batteries'));
  it('turns currency input into integer cents', () => {
    expect(toCents('R 1,299.95')).toBe(129995);
    expect(Number.isNaN(toCents('free-ish'))).toBe(true);
  });
  it('formats ZAR without fake decimals', () => expect(formatMoney(250000)).toContain('2 500'));
  it('rejects external and protocol-relative return URLs', () => {
    expect(safeReturnTo('/sell?id=1')).toBe('/sell?id=1');
    expect(safeReturnTo('//evil.test')).toBe('/');
    expect(safeReturnTo('https://evil.test')).toBe('/');
  });
  it('describes recent listing age', () =>
    expect(relativeTime('2026-08-22T12:00:00Z', new Date('2026-08-22T14:00:00Z'))).toBe('2h ago'));
});
