# Database

Tsuki uses Drizzle schema push rather than committed SQL migrations. Apply schema changes before
deploying API or web code that reads them:

```bash
bun run db:push
```

Run this from the repository root with `DATABASE_URL` set for the target environment. Review the
generated statements before confirming the push.
