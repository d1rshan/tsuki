import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { cacheLife, cacheTag } from "next/cache";

import { db, media, user } from "@tsuki/db";

import { siteUrl } from "@/shared/lib/site";
import { buildSitemapEntries } from "@/shared/lib/sitemap";

/** Cached so crawlers don't hit Postgres on every fetch; tags let re-syncs bust it. */
async function getSitemapData() {
  "use cache: remote";
  cacheLife("days");
  cacheTag("media", "profiles");

  const mediaRows = await db
    .select({ id: media.id, type: media.type, updatedAt: media.updatedAt })
    .from(media);
  const usernames = await db.select({ username: user.username }).from(user);

  return { mediaRows, usernames };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Never prerender at build time: CI has no database access, and a build-baked
  // sitemap would go stale anyway. The cached query keeps request-time cost low.
  await connection();
  const { mediaRows, usernames } = await getSitemapData();
  return [
    { url: `${siteUrl}/social`, changeFrequency: "hourly" as const, priority: 0.8 },
    ...buildSitemapEntries(siteUrl, mediaRows, usernames),
  ];
}
