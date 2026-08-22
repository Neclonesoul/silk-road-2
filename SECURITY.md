# Security

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability. Contact the operator through the configured security/support address with impact, affected route, reproduction steps and any safe proof. Do not access other users’ data, disrupt service or retain personal information while testing.

## Security model

- All authentication and authorization decisions occur server-side.
- Opaque sessions are hashed at rest and delivered in HttpOnly/Secure/SameSite cookies.
- Passwords are salted and stretched using Cloudflare Web Crypto PBKDF2-SHA-256.
- Verification/reset tokens are random, hashed, expiring and single-use.
- D1 operations use prepared statements; dynamic sort clauses come from fixed enums.
- Listing mutations check seller ownership; conversation routes check membership.
- Report, block, favourite, upload and state endpoints require an authenticated user.
- Image bytes are size-bounded and magic-signature checked before private R2 storage.
- Public media access is authorized against current D1 listing state.
- Security headers include a restrictive CSP, clickjacking protection, MIME sniffing protection and a minimal Permissions Policy.
- APIs/private pages are `no-store`; the service worker excludes transactional surfaces.
- Admin access checks the persisted server-side role. Hidden navigation is not authorization.
- Moderation mutations create append-only audit events with request references.

## Operational requirements before launch

- Configure Turnstile and an email provider; verify both in production.
- Use a least-privilege Cloudflare API token and protected GitHub environments.
- Review CSP after adding any external integration.
- Establish incident, evidence retention, law-enforcement and account-deletion procedures.
- Have counsel approve privacy, terms, prohibited-items and consumer-protection text.
- Monitor Worker exceptions, D1 errors, upload rejection rates, auth failures and reports.

## Known security limits

- V1 rate-limit storage exists in the schema, but distributed adaptive abuse scoring is not claimed.
- V1 has human moderation foundations; automated content or image moderation is not claimed.
- PBKDF2 is a standards-based Cloudflare-compatible choice; evaluate a memory-hard password KDF if the runtime later provides a dependable, audited implementation within CPU limits.
- R2 originals are served after authorization; derived/scanned image variants are a planned isolated enhancement.
