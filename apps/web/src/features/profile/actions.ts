"use server";

import { updateTag } from "next/cache";

import { getServerApi } from "@/shared/lib/server-api";
import { getSession } from "@/shared/lib/session";
import { parseUsername } from "@/shared/lib/username";

import { profileUpdateSchema, type ProfileUpdate } from "./schemas";

type UpdateProfileResult = { success: true; error: null } | { success: false; error: string };

/** Clears all cached sections for a profile whose URL slug has just changed. */
export async function invalidateRenamedProfile(previousUsername: string) {
  const username = parseUsername(previousUsername);
  if (!username) return;

  const { user } = await getSession();
  if (!user) return;

  updateTag(`profile-${username}`);
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
