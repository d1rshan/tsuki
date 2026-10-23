import { neon, neonConfig } from "@neondatabase/serverless";
import { env } from "@tsuki/env/db";

// Local Postgres uses the same HTTP driver and transactional batches as Neon.
// Only explicitly configured loopback connections may use the local proxy.
if (env.LOCAL_DATABASE_HTTP_ENDPOINT) {
  const database = new URL(env.DATABASE_URL);
  const endpoint = new URL(env.LOCAL_DATABASE_HTTP_ENDPOINT);
  const loopback = new Set(["localhost", "127.0.0.1", "[::1]"]);
  if (!loopback.has(database.hostname) || !loopback.has(endpoint.hostname)) {
    throw new Error(
      "LOCAL_DATABASE_HTTP_ENDPOINT is only allowed for local development databases.",
    );
  }
  neonConfig.fetchEndpoint = env.LOCAL_DATABASE_HTTP_ENDPOINT;
}

export const sql = neon(env.DATABASE_URL, {
  // Keep Next.js from caching database responses in its fetch cache.
  fetchOptions: { cache: "no-store" },
});
