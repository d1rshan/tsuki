import type { MetadataRoute } from "next";

import { mediaSlug } from "@/features/media/media";

export type SitemapMediaRow = { id: number; type: "ANIME" | "MANGA"; updatedAt: Date };

/** Flat URL assembly from DB rows — kept pure so it can be tested without a database. */
export function buildSitemapEntries(
  siteUrl: string,
  media: SitemapMediaRow[],
  usernames: { username: string }[],
): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    ...media.map((row) => ({
      url: `${siteUrl}/${mediaSlug(row.type)}/${row.id}`,
      lastModified: row.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...usernames.map(({ username }) => ({
      url: `${siteUrl}/${username}`,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
  ];
}
