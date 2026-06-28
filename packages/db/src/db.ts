import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@tsuki/env";

import * as schema from "./schema";

// If DATABASE_URL is not set, don't crash at import time, but when queried.
const sql = neon(env.DATABASE_URL);
export const db = drizzle({ client: sql, schema });
