 <samp>
   <h3>
   月 TSUKI 
   </h3>
  </samp>
<samp>
 > track your anime 
</samp>
<br/>
<br/>

<samp>
bun // next.js // shadcn/ui // elysia.js // drizzle orm // better-auth
</samp>

```bash
bun run setup           # first time
bun run dev             # laptop (starts Docker + apps)
bun run dev:mobile      # same local DB, Tailscale address
bun run db:push         # local Postgres
bun run db:push:prod    # Neon, explicitly
```

Local settings live in root `.env`. Production DB commands use `.secrets/neon.env`.
See [the setup and environment guide](docs/local-development.md).
