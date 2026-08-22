# Database contract

Migrations are ordered and immutable after application. `PRAGMA foreign_keys = ON` and database constraints reduce invalid states.

| Area          | Tables                                              | Contract                                                                    |
| ------------- | --------------------------------------------------- | --------------------------------------------------------------------------- |
| Identity      | `users`, `profiles`, `sessions`                     | Private credentials/session state is separated from public seller identity. |
| Recovery      | `verification_tokens`, `password_reset_tokens`      | Hashed, expiring, one-use tokens.                                           |
| Taxonomy      | `categories`, `category_attributes`                 | Declarative typed fields; no executable category configuration.             |
| Commerce      | `listings`, `listing_attributes`, `listing_images`  | Unified listing model, bounded states and one cover image.                  |
| Intent        | `favorites`                                         | One row per user/listing.                                                   |
| Conversation  | `conversations`, `conversation_members`, `messages` | Listing-centric membership and durable message history.                     |
| Attention     | `notifications`                                     | In-app events with read state and constrained types.                        |
| Safety        | `reports`, `blocks`, `audit_events`                 | Human moderation foundation and traceable mutations.                        |
| Abuse control | `rate_limits`                                       | Fixed-window storage available to server boundaries.                        |

## Listing lifecycle

`draft → active → reserved → sold` is the ordinary path. Active may move directly to sold; reserved may return to active. Draft/active/reserved/expired may be removed. Sold and removed are terminal for seller actions. Admin removal records a reason.

## Search indexes

V1 deliberately uses SQLite queries and indexes rather than an external search service. Status/publish time, category/status, price, location and seller/status indexes support the bounded filters. User input remains prepared-statement data; sort modes map to fixed SQL fragments.

## Migration discipline

- Never edit a migration already applied to any shared environment.
- Add the next numbered SQL file.
- Test it on a fresh local database and on a copy representing the previous schema.
- Keep destructive changes in expand/backfill/contract phases.
- Back up production D1 before high-risk data migrations.
