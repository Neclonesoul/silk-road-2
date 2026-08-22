# Operations runbook

## First administrator

Set `ADMIN_EMAILS` before signup. The account whose normalized email matches the allowlist is created with `admin` role. Verify email delivery and confirm `/admin` access. The database trigger prevents removing the last active administrator.

## First real listing

1. Sign in as the operator or first seller.
2. Open `/sell`; enter an accurate searchable title and category.
3. Complete description, condition, price and approximate location.
4. Add 1–12 original photographs, reorder and set the cover.
5. Save the draft, inspect all fields and publish.
6. Open the listing signed out; confirm only approximate location and public seller data appear.
7. Use a second real test account to favourite, contact and exchange a message.
8. Remove the test artefacts or keep only genuine inventory.

## Release procedure

1. Freeze the release candidate and update changelog/release notes.
2. Run `npm ci && npm run qa` on Linux CI.
3. Apply pending migrations and inspect results.
4. Deploy; run the full smoke test in `DEPLOYMENT.md`.
5. Confirm legal/operator values and public domain metadata.
6. Commit the final provisioning-safe configuration.
7. Create annotated tag `v2.0.0` and GitHub release from `docs/RELEASE-NOTES-v2.0.0.md`.

## Rollback procedure

1. Stop new releases and record the incident start time/request references.
2. Roll back the Worker to the last known-good immutable Cloudflare version.
3. If the incident is data-related, block only the affected mutation path; do not reverse a D1 migration blindly.
4. Restore data from the verified backup/export only after determining scope and consistency.
5. Verify auth, listing ownership, media visibility and conversation membership.
6. Publish an incident note where required, then ship a forward fix through CI.

## Routine maintenance

- Review open reports and moderation audit events.
- Remove expired sessions and used/expired verification/reset tokens on a scheduled maintenance path.
- Monitor D1 query latency/errors, R2 growth, Worker exceptions and email delivery failures.
- Test password recovery and Turnstile after provider/configuration changes.
- Review dependencies and security headers each release.
