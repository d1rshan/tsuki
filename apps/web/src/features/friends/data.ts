import { apiClient } from "@/shared/lib/api-client";

export type FriendsFeedType = "following" | "public";

export async function getFriendsFeed(type: FriendsFeedType, cursor?: string | null) {
  const { data, error } = await apiClient.me.activity.get({
    query: { type, ...(cursor ? { cursor } : {}) },
  });
  if (error || !data) throw error ?? new Error("Failed to load Activity");

  return data;
}

export async function getFriendsDiscovery(username: string) {
  const { data, error } = await apiClient.users.discover.get({
    query: username ? { username } : {},
  });
  if (error || !data) throw error ?? new Error("Failed to load Friends");

  return data.users;
}
