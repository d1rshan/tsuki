"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { getServerApi } from "@/shared/lib/server-api";
import { getSession } from "@/shared/lib/session";
import { parseUsername } from "@/shared/lib/username";

import { profileUpdateSchema, type ProfileUpdate } from "./schemas";

type UpdateProfileResult = { success: true; error: null } | { success: false; error: string };

export async function finishUsernameChange(previousUsername: string, username: string) {
  const previous = parseUsername(previousUsername)?.toLowerCase();
  const next = parseUsername(username)?.toLowerCase();
  const { user } = await getSession();
  if (!previous || !next || user?.username !== next) {
    throw new Error("Could not finish changing the username.");
  }

  updateTag(`profile-${previous}`);
  updateTag(`profile-${next}`);
  redirect(`/profile/${next}`);
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
