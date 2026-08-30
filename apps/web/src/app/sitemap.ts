import type { MetadataRoute } from "next";
import { cacheLife, cacheTag } from "next/cache";

import { db, media, user } from "@tsuki/db";

import { siteUrl } from "@/shared/lib/site";
import { buildSitemapEntries } from "@/shared/lib/sitemap";

/** Cached so crawlers don't hit Postgres on every fetch; tags let re-syncs bust it. */
async function getSitemapData() {
  "use cache: remote";
  cacheLife("max");
  cacheTag("media", "profiles");

  const mediaRows = await db
    .select({ id: media.id, type: media.type, updatedAt: media.updatedAt })
    .from(media);
  const usernames = await db.select({ username: user.username }).from(user);

  return { mediaRows, usernames };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { mediaRows, usernames } = await getSitemapData();
  return buildSitemapEntries(siteUrl, mediaRows, usernames);
}
