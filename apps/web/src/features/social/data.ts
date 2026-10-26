import { apiClient } from "@/shared/lib/api-client";

export type SocialFeedType = "following" | "public";

export async function getSocialFeed(type: SocialFeedType, cursor?: string | null) {
  const query = cursor ? { cursor } : {};
  const { data, error } =
    type === "public"
      ? await apiClient.activity.get({ query })
      : await apiClient.me.activity.get({ query });
  if (error || !data) throw error ?? new Error("Failed to load Activity");

  return data;
}

export async function getSocialDiscovery(username: string) {
  const { data, error } = await apiClient.users.discover.get({
    query: username ? { username } : {},
  });
  if (error || !data) throw error ?? new Error("Failed to load people");

  return data.users;
}

export async function getSocialReviews(type: SocialFeedType, offset = 0) {
  const query = { offset };
  const { data, error } =
    type === "public"
      ? await apiClient.reviews.get({ query })
      : await apiClient.me.reviews.get({ query });
  if (error || !data) throw error ?? new Error("Failed to load reviews");
  return data;
}
