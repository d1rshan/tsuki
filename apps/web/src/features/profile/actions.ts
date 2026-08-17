"use server";

import { updateTag } from "next/cache";

import type { FollowRelationship } from "@tsuki/api/types";

import { getServerApi } from "@/shared/lib/server-api";
import { getSession } from "@/shared/lib/session";
import { THEMES } from "@/shared/lib/themes";
import { parseUsername } from "@/shared/lib/username";

import { profileUpdateSchema, type ProfileUpdate } from "./schemas";

type UpdateProfileResult = { success: true; error: null } | { success: false; error: string };

export async function updateTheme(theme: string): Promise<UpdateProfileResult> {
  const selectedTheme = THEMES.find((entry) => entry.id === theme)?.id;
  if (!selectedTheme) {
    return { success: false, error: "Invalid theme." };
  }

  const { user } = await getSession();
  if (!user?.username) return { success: false, error: "You must be signed in." };

  const { error } = await (await getServerApi()).me.profile.put({ theme: selectedTheme });
  if (error) return { success: false, error: "Failed to update theme." };

  updateTag(`profile-${user.username}`);
  return { success: true, error: null };
}

export async function updateProfile(data: ProfileUpdate): Promise<UpdateProfileResult> {
  const { user } = await getSession();
  if (!user?.username) return { success: false, error: "You must be signed in." };

  const input = profileUpdateSchema.safeParse(data);
  if (!input.success) return { success: false, error: "Check the profile fields and try again." };

  const { error } = await (await getServerApi()).me.profile.put(input.data);
  if (error) return { success: false, error: "Failed to update profile." };

  updateTag(`profile-${user.username}`);
  return { success: true, error: null };
}

export async function setFollowingAction(
  username: string,
  following: boolean,
): Promise<FollowRelationship> {
  const targetUsername = parseUsername(username);
  if (!targetUsername) throw new Error("Invalid username");

  const { user } = await getSession();
  if (!user?.username) throw new Error("Unauthorized");

  const endpoint = (await getServerApi()).users({ username: targetUsername }).follow;
  const { data, error } = following ? await endpoint.post() : await endpoint.delete();
  if (error) throw new Error("Failed to update follow");

  updateTag(`profile-${user.username}-overview`);
  updateTag(`profile-${user.username}-following`);
  updateTag(`profile-${targetUsername}-overview`);
  updateTag(`profile-${targetUsername}-followers`);

  return data;
}
