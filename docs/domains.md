# Domains

What each package and application owns, and how the domains inside them map to
one another. Domain _language_ lives in `CONTEXT.md` (see `CONTEXT-MAP.md`);
this document records the structural scopes — which code owns which domain.

## apps/web — the Tsuki web app

Next.js frontend. Organized by product feature under `src/features/`:

| Feature           | Scope                                                   |
| ----------------- | ------------------------------------------------------- |
| `auth`            | Sign in, sign up, email verification                    |
| `discover`        | Browsing and searching media                            |
| `media`           | Media detail pages; logging, rating, reviewing          |
| `profile`         | Profile pages: overview, stats, heatmap, follower lists |
| `social`          | Follow actions and viewer↔target state                  |
| `friends`         | Friends area: Activity Feed and discovery               |
| `admin`           | Admin dashboard                                         |
| `navbar`, `theme` | Shell concerns                                          |

Talks to the API exclusively through Eden treaty clients (`src/shared/lib/*-api.ts`)
typed by `@tsuki/api`'s `App` export, so route changes are caught at compile time.

## apps/api — the Tsuki API

Elysia backend. One folder per domain under `src/modules/`, each with the same
three files: `index.ts` (routes), `model.ts` (TypeBox request/response
contracts), `service.ts` (everything else).

| Module      | Scope                                                                                   | Routes                                                                         |
| ----------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `media/`    | The owned catalogue: read-only serving + search/trending over our own media table       | `/media/*`                                                                     |
| `library/`  | A user's log entries for media                                                          | `/users/:username/library`, `/me/library/*`                                    |
| `reviews/`  | A user's reviews of media                                                               | `/users/:username/reviews`, `/me/reviews/*`                                    |
| `profiles/` | Identity + Profile: Username→Profile resolution, Profile page payload, profile settings | `/users/:username`, `/me/profile`                                              |
| `social/`   | The social graph: Follow relationships, follower lists, user discovery                  | `/users/discover`, `/users/:username/follow*`, `/users/:username/relationship` |
| `activity/` | The Activity Feed                                                                       | `/me/activity`                                                                 |
| `sync/`     | The Kitsu crawl engine: admin-only sync ticks, cursor state, reset                      | `/admin/sync/*`                                                                |

The `sync` module is the write side of the catalogue: a Vercel cron tick (or an
admin/owner session) advances the crawl a chunk at a time, resuming from the
`sync_state` cursor in `packages/db`. The `media` module is the read side:
serving and searching rows the crawler wrote.

Cross-module dependencies flow one way: `library` and `reviews` use
`profiles/service.ts#requireUser`; `profiles/model.ts` reuses shared
user/relationship schemas from `social/model.ts`; `media` and `sync` serve only
the catalogue and share nothing. Shared plugins (`src/plugins/`): Better Auth
session macros, the error floor, request logging.

## packages/db — persistence

Postgres via Drizzle ORM (Neon). Split into `schema/` (tables, relations,
triggers) and `dal/` (one query module per domain):

| DAL domain | Scope                                                                 |
| ---------- | --------------------------------------------------------------------- |
| `user`     | Account rows and Username lookup                                      |
| `profile`  | Profile settings (bio, banner, social links)                          |
| `media`    | The owned catalogue: media rows crawled from Kitsu, search + trending |
| `library`  | Log entries; per-type stats aggregation                               |
| `reviews`  | Reviews                                                               |
| `social`   | Follows, follower lists, public user columns, discovery query         |
| `activity` | Feed records (LOG / REVIEW / FOLLOW) and the daily progress aggregate |
| `sync`     | `sync_state` cursor rows tracking crawl progress per media type       |

Progress activity is written by a Postgres trigger (`src/triggers.ts`), not
application code.

## packages/kitsu — external integration

The only place that talks to Kitsu's public JSON:API (`kitsu.app/api/edge`):
client (retry/backoff), request builders (`by-id`, `search`, catalogue pages,
`mappings` lookups), and mappers (`toMediaRow`, `toMediaCompactRow`) that shape
responses into our own `MediaRow` types. Everything upstream is funneled through
here; consumers never see Kitsu shapes.

## packages/auth — authentication

Better Auth server instance and client hooks, plus username rules, cookie
handling, email sending, and permission helpers. Mounted by the API
(`plugins/auth.ts`) and consumed by the web app.

## packages/env — configuration

Typed environment validation per consumer (`api`, `db`, `email`, `web`).
Fails fast at startup with a clear message instead of leaking bad config into
runtime behavior.
