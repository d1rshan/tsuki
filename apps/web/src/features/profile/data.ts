import "server-only";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cacheLife, cacheTag } from "next/cache";

import type { MediaType } from "@tsuki/api/types";
import { richContentText } from "@tsuki/rich-content";

import { parseUsername } from "@/shared/lib/username";
import { publicApi } from "@/shared/lib/public-api";
import { getServerApi } from "@/shared/lib/server-api";

type ProfileSection = "followers" | "following" | "library" | "overview" | "reviews";

function tagProfile(username: string, section: ProfileSection) {
  cacheTag("profiles", `profile-${username}`, `profile-${username}-${section}`);
}

/** 404 means "no such Profile" — an answer, not a failure, so callers get null. */
function resolve<T>(
  username: string,
  what: string,
  result: { data?: T | null; error?: { status?: number } | null },
): T | null {
  if (result.error?.status === 404) return null;
  if (result.error)
    throw new Error(`Failed to load ${what} for ${username}`, { cause: result.error });

  return result.data ?? null;
}

/** Parses a route Username, rendering 404 when it cannot be one. */
export function resolveUsername(value: string) {
  const username = parseUsername(value);
  if (!username) notFound();

  return username;
}

export async function getProfileOverview(username: string) {
  "use cache: remote";
  cacheLife("minutes");
  tagProfile(username, "overview");

  const { data, error } = await publicApi.users({ username }).get();
  return resolve(username, "profile", { data, error });
}

export async function getProfileLibrary(username: string, mediaType?: MediaType) {
  "use cache: remote";
  cacheLife("minutes");
  tagProfile(username, "library");

  const { data, error } = await publicApi
    .users({ username })
    .library.get({ query: mediaType ? { type: mediaType } : {} });
  return resolve(username, "library", { data, error });
}

export async function getProfileReviews(username: string, mediaType?: MediaType) {
  "use cache: remote";
  cacheLife("minutes");
  tagProfile(username, "reviews");

  const { data, error } = await publicApi
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
  "use cache: remote";
  cacheLife("minutes");
  tagProfile(username, section);

  const { data, error } = await publicApi.users({ username })[section].get({
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
    throw new Error(`Failed to load follow state for ${username}`, { cause: error });

  return data;
}

export async function getProfileMetadata(username: string): Promise<Metadata> {
  const profile = await getProfileOverview(username);
  if (!profile) return { title: "Profile not found" };

  return {
    title: profile.user.displayUsername,
    description:
      richContentText(profile.profile?.bio).trim().slice(0, 160) ||
      `View @${profile.user.username} on Tsuki.`,
  };
}
