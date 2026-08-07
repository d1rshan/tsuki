# Tsuki — Agent Rules

Tsuki is an anime tracking platform (like Letterboxd for anime), built as a Turborepo monorepo using Bun.

## Repo Structure

- `apps/web` — Next.js 16.2.9 frontend (`cacheComponents` enabled), uses shadcn/ui
- `apps/api` — Elysia backend, uses Better Auth
- `packages/db` — Neon Postgres via Drizzle ORM
- `packages/anilist` — AniList GraphQL API client and all related utilities
- `docs/` — has AniList GraphQL docs if present (gitignored)

## FYI

- `cn` util lives in `apps/web/lib/utils.ts`

- **import order** — four groups separated by a blank line: external libraries → monorepo packages → path-aliased imports (`@/`) → local relative imports.

- for next.js:
  <!-- BEGIN:nextjs-agent-rules -->
  This version has breaking changes — APIs, conventions, and file structure may differ from training data. Read the relevant guide in `apps/web/node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
  <!-- END:nextjs-agent-rules -->
