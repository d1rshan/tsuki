import { cacheTag, cacheLife } from "next/cache";

import type { MediaType } from "@tsuki/api/types";

import { api } from "@/lib/api";

type Result<T> = { data: T; error: null } | { data: null; error: unknown };

/**
 * Every profile query is cached under the same scope, so a mutation can bust one
 * section (`profile-bunny-library`) or the whole profile (`profile-bunny`).
 */
function tags(username: string, section: "overview" | "library" | "reviews") {
  return [`profile-${username}`, `profile-${username}-${section}`, "profile"] as const;
}

export async function getProfileOverview(username: string) {
  "use cache";
  cacheTag(...tags(username, "overview"));
  cacheLife("max");

  const { data, error } = await api.users({ username }).get();
  return (error ? { data: null, error } : { data, error: null }) as Result<typeof data>;
}

/** Omit `mediaType` to get anime and manga together, most recently updated first. */
export async function getProfileLibrary(username: string, mediaType?: MediaType) {
  "use cache";
  cacheTag(...tags(username, "library"));
  cacheLife("max");

  const { data, error } = await api
    .users({ username })
    .library.get({ query: mediaType ? { type: mediaType } : {} });

  return (error ? { data: null, error } : { data, error: null }) as Result<typeof data>;
}

/** Omit `mediaType` to get anime and manga reviews together, newest first. */
export async function getProfileReviews(username: string, mediaType?: MediaType) {
  "use cache";
  cacheTag(...tags(username, "reviews"));
  cacheLife("max");

  const { data, error } = await api
    .users({ username })
    .reviews.get({ query: mediaType ? { type: mediaType } : {} });

  return (error ? { data: null, error } : { data, error: null }) as Result<typeof data>;
}
