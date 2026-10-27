import "server-only";

import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { cache } from "react";

import type { MediaType } from "@tsuki/api/types";
import { richContentText } from "@tsuki/rich-content";

import { parseUsername } from "@/shared/lib/username";
import { publicApi } from "@/shared/lib/public-api";
import { getServerApi } from "@/shared/lib/server-api";
import { siteName } from "@/shared/lib/site";

/** 404 means "no such Profile" — an answer, not a failure, so callers get null. */
function resolve<T>(
  username: string,
  what: string,
  result: { data?: T | null; error?: { status?: number } | null },
): T | null {
  if (result.error?.status === 404) return null;
  if (result.error)
    throw new Error(`Failed to load ${what} for ${username}`, {
      cause: result.error,
    });

  return result.data ?? null;
}

/** Parses a route Username, rendering 404 when it cannot be one. */
export function resolveUsername(value: string) {
  const username = parseUsername(value);
  if (!username) notFound();

  return username;
}

/** Public identity is prefetched separately from session and tab content. */
export async function getProfileIdentity(username: string) {
  "use cache: remote";
  cacheTag(`profile-${username}`, "profiles");
  cacheLife("hours");

  const { data, error } = await publicApi.users({ username }).identity.get();
  return resolve(username, "profile identity", { data, error });
}

export const getProfileOverview = cache(async (username: string) => {
  const { data, error } = await (await getServerApi()).users({ username }).get();
  return resolve(username, "profile", { data, error });
});

export async function getProfileLibrary(username: string, mediaType?: MediaType) {
  const { data, error } = await (
    await getServerApi()
  )
    .users({ username })
    .library.get({ query: mediaType ? { type: mediaType } : {} });
  return resolve(username, "library", { data, error });
}

export async function getProfileReviews(username: string, mediaType?: MediaType) {
  const { data, error } = await (
    await getServerApi()
  )
    .users({ username })
    .reviews.get({ query: mediaType ? { type: mediaType } : {} });
  return resolve(username, "reviews", { data, error });
}

async function getProfileConnections(
  username: string,
  section: "followers" | "following",
  limit: number,
  offset: number,
) {
  const { data, error } = await (await getServerApi()).users({ username })[section].get({
    query: { limit, offset },
  });
  return resolve(username, section, { data, error });
}

export const getProfileFollowers = (username: string, limit: number, offset: number) =>
  getProfileConnections(username, "followers", limit, offset);

export const getProfileFollowing = (username: string, limit: number, offset: number) =>
  getProfileConnections(username, "following", limit, offset);

/** Viewer-specific data must never share the public Profile cache. */
export async function getProfileViewerRelationship(username: string) {
  const { data, error } = await (await getServerApi()).users({ username }).relationship.get();
  if (error || !data)
    throw new Error(`Failed to load follow state for ${username}`, {
      cause: error,
    });

  return data;
}

export async function getProfileMetadata(username: string): Promise<Metadata> {
  const profile = await getProfileOverview(username);
  if (!profile) {
    return {
      title: "Profile not found",
      robots: { index: false, follow: false },
    };
  }

  const name = profile.user.displayUsername;
  const description =
    (profile.locked ? "" : richContentText(profile.profile?.bio).trim().slice(0, 160)) ||
    `View @${profile.user.username} on Tsuki.`;
  const url = `/${username}`;

  return {
    title: name,
    description,
    ...(profile.locked && { robots: { index: false, follow: false } }),
    alternates: { canonical: url },
    openGraph: {
      type: "profile",
      url,
      title: name,
      description,
      siteName: siteName,
    },
    twitter: { card: "summary_large_image", title: name, description },
  };
}

export async function getProfileStatistics(username: string) {
  const { data, error } = await (await getServerApi()).users({ username }).stats.get();
  return resolve(username, "statistics", { data, error });
}
