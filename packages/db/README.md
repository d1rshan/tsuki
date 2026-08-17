# Database

Drizzle migrations are the source of truth for database structure and behavior.

```bash
bun run db:generate # after changing the TypeScript schema
bun run db:migrate  # apply pending migrations
bun run db:studio
```

PostgreSQL features that Drizzle cannot declare, such as triggers, belong in a
custom migration created with `drizzle-kit generate --custom --name <name>`.
