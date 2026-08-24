"use server";

import { updateTag } from "next/cache";

import type { FollowRelationship } from "@tsuki/api/types";

import { getServerApi } from "@/shared/lib/server-api";
import { getSession } from "@/shared/lib/session";
import { parseUsername } from "@/shared/lib/username";

export type FollowResult =
  | { success: true; relationship: FollowRelationship }
  | { success: false; error: string };

export async function setFollowing(username: string, following: boolean): Promise<FollowResult> {
  const targetUsername = parseUsername(username);
  if (!targetUsername) return { success: false, error: "Invalid Username." };

  const { user } = await getSession();
  if (!user?.username) return { success: false, error: "You must be signed in." };

  const endpoint = (await getServerApi()).users({ username: targetUsername }).follow;
  const { data, error } = following ? await endpoint.post() : await endpoint.delete();
  if (error || !data) return { success: false, error: "Failed to update follow." };

  updateTag(`profile-${user.username}-overview`);
  updateTag(`profile-${user.username}-following`);
  updateTag(`profile-${targetUsername}-overview`);
  updateTag(`profile-${targetUsername}-followers`);

  return { success: true, relationship: data };
}
