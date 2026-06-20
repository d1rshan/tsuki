import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

// If DATABASE_URL is not set, don't crash at import time, but when queried.
const sql = neon(process.env.DATABASE_URL || "postgres://localhost:5432/tsuki");
export const db = drizzle({ client: sql, schema });
