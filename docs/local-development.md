# Local development

Install Bun and Docker with Compose, then run from the repository root:

```bash
bun install
bun run setup
bun run dev
```

The setup command creates a private root `.env` with a generated local auth secret
if it does not exist. Optional service credentials go in that same file; see
[.env.example](../.env.example). Docker database/proxy URLs and localhost ports
are supplied by the launcher. Do not put production database credentials here.

For a Treehouse worktree, run `treehouse` from the main checkout, then `bun install`
in the worktree. `.worktreeinclude` copies only the root `.env`. Copies are
independent; production credentials are intentionally excluded. Worktrees currently
share the same Docker database and ports, so run one dev server at a time.

`setup` starts Postgres and a local Neon HTTP proxy, waits for readiness,
applies the schema, search extension and triggers, then populates the catalog.
The proxy keeps the same database driver and atomic profile-update batches as
production; it talks only to the Postgres container, never Neon cloud.

The first setup crawls all anime and manga from Kitsu. Allow several hours and
keep the command running. If interrupted, rerun `bun run setup`: it resumes
saved cursors and skips already completed collections. A successful setup saves
a catalog snapshot automatically. Later setup runs preserve existing data. An
empty database restores the snapshot when one is available.

Only root `.env` is read for local commands. The launcher replaces inherited app
settings, supplies the fixed Docker URLs, and passes configuration to child
processes. Bun's automatic env loading is disabled in `bunfig.toml`; package-level
env files and root `.env.local` are rejected to prevent hidden overrides.
`local:up` starts containers without changing any env files.

The database and proxy listen only on loopback, ports 55432 and 55433.

## Commands

| Command                           | Behavior                                                                                                                        |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `bun run setup`                   | First-time setup: services, schema/indexes/triggers, catalog restore or resumable crawl, snapshot.                              |
| `bun run dev`                     | Start local Docker services, API, and web at `http://localhost:3000`.                                                           |
| `bun run dev:mobile`              | Same local database and services, using the detected Tailscale app address.                                                     |
| `bun run local:up`                | Start containers without starting the apps or crawling.                                                                         |
| `bun run db:push`                 | Apply schema, search indexes, and triggers to local Postgres.                                                                   |
| `bun run db:studio`               | Inspect local Postgres.                                                                                                         |
| `bun run catalog:sync`            | Refresh local catalog; resumes after interruption.                                                                              |
| `bun run catalog:snapshot`        | Save the current catalog snapshot.                                                                                              |
| `bun run local:stop`              | Stop containers; preserve database and snapshot.                                                                                |
| `bun run env:check`               | Show selected local database and app address without connecting.                                                                |
| `bun run build` / `bun run start` | Build/run locally in production runtime mode, still using Docker Postgres. Build starts Docker and a temporary API when needed. |

`local:setup`, `local:sync`, `local:snapshot`, and `tailscale` remain aliases for existing habits.
Append `--dry-run` to launcher commands to inspect their subprocesses without executing them.
For example: `bun run db:push:prod --dry-run`.

## Production

Deployed apps receive configuration from their Vercel project settings. Keep the
web and API production auth secrets aligned, with their production app/API URLs
and Neon database URL. Local root `.env` is never a deployment config source.
Use each app's own build command on Vercel; root `build` is for local validation.

For explicit production database administration, copy
[.secrets/neon.env.example](../.secrets/neon.env.example) to `.secrets/neon.env`
and set `DATABASE_URL` to the Neon connection string. This file is ignored and
is used only by commands ending in `:prod`:

```bash
bun run env:check:prod       # show host/database, no connection or credentials printed
bun run db:push:prod         # schema + search indexes + triggers on Neon
bun run db:studio:prod       # inspect Neon
```

Production DB commands discard inherited database settings and the local proxy.
They require a PostgreSQL URL on a `.neon.tech` host and never fall back to the
local `.env`. The same commands work from `packages/db`.
`db:cleanup-activity` and `db:cleanup-activity:prod` explicitly select the target
for the one-off cleanup described in [the database guide](../packages/db/README.md).

To change production app settings, update the hosting project settings; changing
root `.env` affects local development only. Preview deployments should have their
own database and credentials.

## Catalog refresh

Run `catalog:sync` every few days when you want fresh data. It uses the same
incremental engine as the nightly production cron, without needing the API
server or a local scheduler. Run `catalog:snapshot` afterward when you want that
freshness included in your saved snapshot. Normal app/container restarts never
require reseeding.

## Storage and recovery

The named Docker volume `tsuki-local_postgres_data` holds the live database,
including your locally created account, library and activity. Stopping or
replacing containers preserves it. Removing the volume deletes that database.
Avoid `docker compose down -v` unless you intend to delete it.

`.local-dev/catalog.dump` is a compressed PostgreSQL archive on your machine,
outside Docker-managed storage and outside Git. It includes only the `media`
catalog table, including its genres, images and external links. Accounts,
sessions, libraries, reviews, activity and sync execution state are excluded.
Deleting Docker volumes leaves this snapshot intact, but deleting the repo or
losing the disk does not. Copy it elsewhere if you need a durable backup.
It is not a backup of your manually created account/activity.

Restore is automatic only into an empty catalog. Setup never truncates existing
data. Snapshots are data-only and restored into the current schema; after a
future incompatible schema change, an old snapshot may need to be regenerated
with a fresh Kitsu crawl. Images and optional services still require internet.

To inspect services, run `docker compose ps` or `docker compose logs neon-proxy`.
Local scripts never use an inherited remote `DATABASE_URL`; their database
target and connection credentials are fixed to this local Compose setup.

## Access from a phone with Tailscale

Connect both devices to the same tailnet, then run `bun run dev:mobile` from
the repository root. It starts Docker automatically, detects the computer's
Tailscale IPv4 address, and prints the URL to open on your phone. The API stays
at localhost:3001 behind the web app's `/api` proxy; only port 3000 needs to be
reachable over Tailscale. No files change, and the same local account/catalog
is available in both modes.

Stop with Ctrl+C. Docker remains running; use `bun run local:stop` to stop it.
If the phone cannot connect, check your firewall permits port 3000 over Tailscale.
