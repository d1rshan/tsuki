# Tsuki — Agent Rules

Tsuki is an anime tracking platform (like Letterboxd for anime), built as a Turborepo monorepo using Bun.

## Repo Structure

- `apps/web` — Next.js 16.3.0 frontend (`cacheComponents` enabled), uses shadcn/ui
- `apps/api` — Elysia backend, uses Better Auth
- `packages/db` — Neon Postgres via Drizzle ORM
- `packages/anilist` — AniList GraphQL API client and all related utilities
- `docs/` — has AniList GraphQL docs if present (gitignored)

## FYI

- `cn` util lives in `apps/web/src/shared/lib/utils.ts`

- **import order** — four groups separated by a blank line: external libraries → monorepo packages → path-aliased imports (`@/`) → local relative imports.

- for next.js:
  <!-- BEGIN:nextjs-agent-rules -->
  This version has breaking changes — APIs, conventions, and file structure may differ from training data. Read the relevant guide in `apps/web/node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
  <!-- END:nextjs-agent-rules -->

## Agent skills

### Issue tracker

Issues live as markdown files under `.scratch/<feature-slug>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the default canonical labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

This is a multi-context repository using `CONTEXT-MAP.md`, context-specific `CONTEXT.md` files, and scoped ADRs. See `docs/agents/domain.md`.
