# Review and port the Drizzle Kit introspection patch before upgrading

Status: ready-for-agent

PR #87 pins Drizzle Kit to 0.31.10 so `patchedDependencies` continues applying
`patches/drizzle-kit@0.31.10.patch`. Bun can otherwise install 0.31.11 without
applying that patch. See `packages/db/README.md` for the introspection bugs.

Compare upstream's implementation, port any fixes still required to the new
version, update the patch registration and lockfile, and verify introspection
and schema diffing against a disposable database. Do not remove the patch
without confirming that all documented bugs are fixed upstream.
