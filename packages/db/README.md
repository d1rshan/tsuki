# Database

`schema.ts` and the live database are the source of truth — there are no
migration files.

```bash
bun run db:push     # sync schema.ts to the DB, then re-apply triggers
bun run db:studio
```

PostgreSQL features that Drizzle cannot declare (triggers, functions) live in
`src/triggers.ts` as idempotent SQL. `db:push` applies them automatically after
every push, so they exist on fresh databases too.

## The drizzle-kit patch — do not delete

`../patches/drizzle-kit@0.31.10.patch` (registered under `patchedDependencies`
in the root `package.json`) fixes three introspection bugs in drizzle-kit
0.31.10 that break push. It is applied on every `bun install`.

How `drizzle-kit push` works: introspect the live DB → read `schema.ts` → diff
the two → emit SQL for differences. All three bugs made step 1 misreport what
the DB contains, so push generated wrong (or fatally redundant) SQL:

1. **FK-target unique indexes are invisible** — the "is this index
   constraint-generated?" probe joined _all_ constraints on `conindid`, but FKs
   also record their referenced table's unique index there (`media_id_type_unique`
   is targeted by two FKs). Skipped during introspection → push re-created it on
   every run → `relation "media_id_type_unique" already exists`. Fix: exclude
   `contype = 'f'` from the probe.
2. **Composite primary keys came back in arbitrary column order** — the
   constraints query had no `ORDER BY`, so `social`'s PK introspected as
   `(following_id, follower_id)` vs schema's `(follower_id, following_id)` →
   dropped and recreated on every push. Fix: `ORDER BY c.ordinal_position`.
3. **Expression defaults never converged** — drizzle strips a trailing cast
   from the introspected default but not from the schema side, so
   `(now() at time zone 'UTC')::date` could never match its own stored form →
   no-op `SET DEFAULT` on every push. Fixed schema-side, not patched:
   `activity_date` uses `` sql`(now() AT TIME ZONE 'UTC'::text)` `` (no explicit
   cast; Postgres coerces to `date`). Don't "clean up" that expression.

Consequence of fix 1: unique indexes used as composite FK targets must be
declared with `uniqueIndex`, not `unique()` — named unique constraints trip a
separate introspection gap and get re-suggested forever.

### When upgrading drizzle-kit

The patch pins to exactly `drizzle-kit@0.31.10`; bun will refuse version bumps
while it exists. On upgrade: check whether upstream fixed these bugs (v1 RC
already has #1), port whatever is still missing to a new patch file, then delete
this one deliberately.
