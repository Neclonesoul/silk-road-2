# Silk Road 2.0

**Find it. Sell it. Talk directly.**

Silk Road 2.0 is the production successor to the original Java/JavaFX Silk Road marketplace. It is a mobile-first public marketplace with real accounts, seller profiles, normalized listings, R2 image storage, favourites, listing-centric realtime conversations, notifications, reporting, blocking, moderation foundations and an installable PWA.

Production starts with an empty marketplace by design. Taxonomy is seeded; sellers, listings, ratings, sales and activity are never fabricated.

## Stack

- SvelteKit 2, Svelte 5, TypeScript strict mode and Tailwind CSS 4
- Cloudflare Workers, D1, R2 and Durable Objects/WebSockets
- Web Crypto PBKDF2 password hashing and server-side opaque sessions
- Turnstile and optional Resend transactional email
- Vitest, Playwright, ESLint, Prettier and GitHub Actions

## Product surfaces

- `/` inventory-first Explore experience and honest first-shop state
- `/search` keyword/category/price/condition/location/date filters
- `/sell` progressive listing creation; `/sell/[id]` drafts, details, 1–12 images and publish
- `/listings/[slug]` public detail, gallery, seller trust, contact and sharing
- `/messages` listing-centric inbox and realtime conversation rooms
- `/favourites`, `/notifications`, `/you`, `/you/listings`
- `/sellers/[handle]`, `/report`, `/admin`
- Verification, password recovery, privacy, terms, offline fallback, sitemap and robots

## Local start

```sh
npm install
npm run check
npm run test
npm run build
```

The public empty-state UI builds without live bindings. Account, listing, upload and messaging flows require local or production Cloudflare bindings. Apply local migrations with:

```sh
npm run db:migrate:local
npm run dev
```

Copy `.env.example` to `.env` for ordinary SvelteKit configuration. Use `.dev.vars` for local Worker secrets; neither file is committed.

For the browser journeys, install Chromium once, migrate the local D1 database, then run both mobile and desktop projects:

```sh
npx playwright install chromium
npm run db:migrate:local
npm run test:e2e
```

## Deployment path

Read [DEPLOYMENT.md](DEPLOYMENT.md) before provisioning. It gives the exact D1, R2, secret, migration, deploy, domain, admin, release and rollback sequence. Android-first operators should also read [docs/TERMUX.md](docs/TERMUX.md).

## Documentation

- [Architecture](ARCHITECTURE.md)
- [Deployment](DEPLOYMENT.md)
- [Security](SECURITY.md)
- [Database](docs/DATABASE.md)
- [Legacy mapping](docs/LEGACY-MAPPING.md)
- [Operations runbook](docs/RUNBOOK.md)
- [Release notes draft](docs/RELEASE-NOTES-v2.0.0.md)
- [Contributing](CONTRIBUTING.md)

## Release position

The prepared version is **2.0.0** because it is explicitly the second-generation successor to the original product, not an unrelated new marketplace. No Git tag is included; tag only after production provisioning and live smoke testing.

## Licence and legacy attribution

New Silk Road 2.0 code is MIT licensed. The original project is referenced for its public product/domain concepts and credited in [docs/LEGACY-MAPPING.md](docs/LEGACY-MAPPING.md); its source code and bundled imagery are not copied into this repository.
