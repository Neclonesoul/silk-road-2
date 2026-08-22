# Contributing

Keep production behaviour stable, commits small and ownership explicit.

1. Create a focused branch.
2. Install with `npm ci`.
3. Make the smallest coherent change at the appropriate boundary.
4. Add a migration only when the data contract changes; never edit an applied production migration.
5. Add meaningful tests for values, authorization or the critical journey affected.
6. Run `npm run qa` and, when applicable, `npm run test:e2e`.
7. Update documentation and `CHANGELOG.md` for user/operator-visible behaviour.

Do not add fake production listings, arbitrary executable category configuration, client-trusted authorization, exact private addresses, large UI frameworks or dependencies without a concrete operational benefit.

Security issues follow [SECURITY.md](SECURITY.md), not public issue tracking.
