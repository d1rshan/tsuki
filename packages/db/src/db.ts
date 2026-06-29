import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@tsuki/env";

import * as schema from "./schema";

// If DATABASE_URL is not set, don't crash at import time, but when queried.
const sql = neon(env.DATABASE_URL, {
  fetchOptions: {
    // Next.js 15 aggressively patches global fetch and will throw an AbortError
    // when suspending dynamic server components. This opts the DB out of Next.js's fetch cache.
    cache: "no-store",
  },
});
export const db = drizzle({ client: sql, schema });
