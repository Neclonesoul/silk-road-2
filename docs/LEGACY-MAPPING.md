# Legacy mapping

The original repository by Farbod Khorramvatan, Pooyan Oskouhi, Ali Bakhshesh and Sara Hosseini is used as a historical/domain reference. Its public README described a Windows JavaFX marketplace with guest browsing, accounts, adverts, favourites, search, direct chat, unread notifications, email verification, password recovery and theme switching.

No original source code, FXML or marketplace image fixture is copied into Silk Road 2.0.

| Legacy concept                                   | Silk Road 2.0 successor                                               |
| ------------------------------------------------ | --------------------------------------------------------------------- |
| JavaFX application/window                        | SvelteKit SSR routes and Svelte components                            |
| Guest screen                                     | Public Explore, search, listing and seller routes                     |
| Light/Dark FXML duplicates                       | One component tree using semantic CSS tokens                          |
| `Account` object and Accounts database class     | `users`, `profiles`, `sessions`, verification/reset tokens            |
| Bookmarked advert identifiers                    | `favorites` join table and optimistic UI                              |
| Per-product Java classes                         | One `listings` model plus declarative category attributes             |
| Per-category SQLite table/classes                | Normalized D1 category/listing schema                                 |
| City string                                      | Approximate `locality` + `region`; no exact residential coordinates   |
| Local `AdImages`/`UserImages` directories        | Private R2 objects with authorized media route                        |
| Client/server LAN sockets and hard-coded IP/port | HTTPS Worker endpoints and authenticated WebSocket upgrades           |
| Pairwise chat by sender/receiver                 | Listing-centric conversations, membership and D1 messages             |
| Threaded socket notification polling             | D1 notifications plus realtime broadcast coordination                 |
| Online status boolean                            | Ephemeral Durable Object presence, never fabricated                   |
| Custom AES transport wrapper                     | Standard TLS provided by Cloudflare; no custom transport cryptography |
| MD5-era password/database helpers                | Web Crypto PBKDF2 password storage and opaque hashed sessions         |
| Random desktop captcha                           | Cloudflare Turnstile at auth abuse boundaries                         |
| Desktop email OTP/recovery screens               | Expiring hashed verification/reset links and email provider boundary  |
| Numerous controllers with repeated logic         | Small server boundaries, pure transformations and shared components   |

## Deliberately abandoned patterns

- LAN-only deployment and hard-coded network coordinates
- duplicated controllers/views per theme
- inheritance trees and tables for each sellable item type
- local filesystem media as database identity
- client-held authority over records
- custom cryptographic transport protocols
- raw SQL string construction and concatenated identifiers
- fake or preloaded marketplace social proof
