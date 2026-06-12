import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.ts';

// IfDATABASE_URL is not set, don't crash at import time, but when queried.
const queryClient = postgres(process.env.DATABASE_URL || "postgres://localhost:5432/anilog");
export const db = drizzle(queryClient, { schema });

export * from './schema.ts';
