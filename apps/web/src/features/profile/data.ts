import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import type { MediaType } from "@tsuki/api/types";

import { publicApi } from "@/shared/lib/public-api";

type ProfileSection = "followers" | "following" | "library" | "overview" | "reviews";

function tagProfile(username: string, section: ProfileSection) {
  cacheTag("profiles", `profile-${username}`, `profile-${username}-${section}`);
}

function isNotFound(error: { status?: number } | null) {
  return error?.status === 404;
}

export async function getProfileOverview(username: string) {
  "use cache: remote";
  cacheLife("minutes");
  tagProfile(username, "overview");

  const { data, error } = await publicApi.users({ username }).get();
  if (isNotFound(error)) return null;
  if (error) throw new Error(`Failed to load profile for ${username}`, { cause: error });

  return data;
}

export async function getProfileLibrary(username: string, mediaType?: MediaType) {
  "use cache: remote";
  cacheLife("minutes");
  tagProfile(username, "library");

  const { data, error } = await publicApi
    .users({ username })
    .library.get({ query: mediaType ? { type: mediaType } : {} });

  if (isNotFound(error)) return null;
  if (error) throw new Error(`Failed to load library for ${username}`, { cause: error });

  return data;
}

export async function getProfileReviews(username: string, mediaType?: MediaType) {
  "use cache: remote";
  cacheLife("minutes");
  tagProfile(username, "reviews");

  const { data, error } = await publicApi
    .users({ username })
    .reviews.get({ query: mediaType ? { type: mediaType } : {} });

  if (isNotFound(error)) return null;
  if (error) throw new Error(`Failed to load reviews for ${username}`, { cause: error });

  return data;
}

export async function getProfileFollowers(username: string) {
  "use cache: remote";
  cacheLife("minutes");
  tagProfile(username, "followers");

  const { data, error } = await publicApi.users({ username }).followers.get();
  if (isNotFound(error)) return null;
  if (error) throw new Error(`Failed to load followers for ${username}`, { cause: error });

  return data;
}

export async function getProfileFollowing(username: string) {
  "use cache: remote";
  cacheLife("minutes");
  tagProfile(username, "following");

  const { data, error } = await publicApi.users({ username }).following.get();
  if (isNotFound(error)) return null;
  if (error) throw new Error(`Failed to load following for ${username}`, { cause: error });

  return data;
}
