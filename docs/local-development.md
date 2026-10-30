# Local development

Install Bun and Docker with Compose, then run from the repository root:

```bash
bun install
bun run local:setup
bun run dev
```

`local:setup` starts Postgres and a local Neon HTTP proxy, waits for readiness,
applies the schema, search extension and triggers, then populates the catalog.
The proxy keeps the same database driver and atomic profile-update batches as
production; it talks only to the Postgres container, never Neon cloud.

The first setup crawls all anime and manga from Kitsu. Allow several hours and
keep the command running. If interrupted, rerun `bun run local:setup`: it resumes
saved cursors and skips already completed collections. A successful setup saves
a catalog snapshot automatically. Later setup runs preserve existing data. An
empty database restores the snapshot when one is available.

The scripts write local connection overrides into gitignored `.env.local` files
at the root, API, web and database package. Existing `.env` files are untouched;
existing `.env.local` contents are backed up privately under
`.local-dev/env-backups/` before the first change. The API and web share the same
authentication secret. Optional external services retain their existing settings.
The database and proxy listen only on loopback, ports 55432 and 55433.

## Commands

| Command                  | Behavior                                                                                                        |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `bun run local:setup`    | Start services, apply schema, restore or resume the first full crawl, save a snapshot.                          |
| `bun run local:up`       | Start services and configure local environment without crawling.                                                |
| `bun run local:sync`     | Start services and run incremental Kitsu sync against the local catalog. Rerun after an interruption to resume. |
| `bun run local:snapshot` | Atomically replace the host catalog snapshot with the current catalog.                                          |
| `bun run local:stop`     | Stop services and preserve the database and snapshot.                                                           |

Run `local:sync` every few days when you want fresh data. It uses the same
incremental engine as the nightly production cron, without needing the API
server or a local scheduler. Run `local:snapshot` afterward when you want that
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

Connect both devices to the same tailnet, then run `bun run tailscale` from
the repository root. Open the URL printed by the command on your phone. The
command discovers the computer's Tailscale IPv4 address and configures the
app and authentication for it for that session; it does not edit your env files.
Stop it with Ctrl+C. Start the local database separately with `bun run local:up`
if you use the Docker setup above. If the phone cannot connect, check your
firewall permits connections to port 3000 over Tailscale.
