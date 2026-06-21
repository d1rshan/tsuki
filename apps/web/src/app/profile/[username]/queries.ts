import { cacheTag } from "next/cache";

import { api } from "@/lib/api";

export async function getProfileOverview(username: string) {
  "use cache";
  cacheTag(`profile-${username}`, `profile-${username}-overview`, "profile");

  const res = await api.users({ username }).overview.get();

  if (res.error) {
    return { data: null, error: res.error, status: res.status } as const;
  }

  return { data: res.data, error: null, status: res.status } as const;
}

export async function getProfileLibrary(username: string) {
  "use cache";
  cacheTag(`profile-${username}`, `profile-${username}-library`, "profile");

  const res = await api.users({ username }).library.get();

  if (res.error) {
    return { data: null, error: res.error, status: res.status } as const;
  }

  return { data: res.data, error: null, status: res.status } as const;
}

export async function getProfileReviews(username: string) {
  "use cache";
  cacheTag(`profile-${username}`, `profile-${username}-reviews`, "profile");

  const res = await api.users({ username }).reviews.get();

  if (res.error) {
    return { data: null, error: res.error, status: res.status } as const;
  }

  return { data: res.data, error: null, status: res.status } as const;
}

// TODO: not sure about this data fetching pattern
