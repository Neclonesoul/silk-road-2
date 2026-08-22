import { describe, expect, it } from 'vitest';
import { hashPassword, randomToken, sha256, verifyPassword } from '$server/crypto';

describe('authentication primitives', () => {
  it('hashes and verifies without storing the password', async () => {
    const password = 'Long-Unique-Passphrase-7';
    const stored = await hashPassword(password);
    expect(stored).not.toContain(password);
    expect(await verifyPassword(stored, password)).toBe(true);
    expect(await verifyPassword(stored, 'wrong-password')).toBe(false);
  }, 15000);
  it('creates unguessable tokens that hash deterministically', async () => {
    const first = randomToken();
    const second = randomToken();
    expect(first).not.toBe(second);
    expect(first.length).toBeGreaterThan(30);
    expect(await sha256(first)).toBe(await sha256(first));
  });
});
