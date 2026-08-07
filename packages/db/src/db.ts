import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@tsuki/env";

import * as schema from "./schema";

// If DATABASE_URL is not set, don't crash at import time, but when queried.
const sql = neon(env.DATABASE_URL, {
  fetchOptions: {
    // Keep Next.js from caching DB responses in its fetch cache.
    cache: "no-store",
  },
});

// KNOWN NOISE — "NeonDbError: Error connecting to database: AbortError: This
// operation was aborted" in the web app's dev logs. Not a real DB failure;
// intentionally unfixed.
//
// neon-http issues every query as a `fetch`, so queries are cancellable by an
// AbortSignal. With `cacheComponents: true` (apps/web/next.config.ts), Next runs
// a prerender/warmup pass before the real render. In that pass `headers()`
// resolves with real request data, so a session lookup fires a real query — but
// Next aborts the pass roughly a tick after it hits the dynamic input (see
// scheduleOnNextTick(() => controller.abort()) in next/dist/server/app-render/
// dynamic-rendering.js). A Neon round-trip is far slower than a tick, so the
// fetch dies mid-flight. Better Auth logs the rejection at ERROR, then Next
// throws the pass away and the real render's query succeeds. The page is fine.
//
// Tells it apart from a genuine connection problem: the DOMException is code 20
// (ABORT_ERR). A real timeout would be code 23 (TimeoutError).
//
// It fires once per page load because the navbar's session lookup sits in the
// root layout. Setting `cache: "no-store"` above does NOT suppress it — this is
// an abort signal, not Next's fetch cache.
//
// If it ever needs silencing: filter AbortError causes in Better Auth's
// `logger`, or move this client to the socket-based `drizzle-orm/neon-serverless`,
// whose queries aren't tied to a fetch signal.

export const db = drizzle({ client: sql, schema });
