"use server";

import { updateTag } from "next/cache";

import { serverApi } from "@/lib/server-api";

export async function updateProfile(
  data: {
    bio: string | null;
    bannerImage: string | null;
    accentColor: string | null;
    socialLinks: Record<string, string> | null;
  },
  username: string,
) {
  try {
    const api = await serverApi();
    const res = await api.me.profile.put(data);

    if (res.error) {
      return { success: false, error: "Failed to update profile. Please check your inputs." };
    }

    updateTag(`profile-${username}`);
    return { success: true, error: null };
  } catch (error) {
    console.error("Failed to update profile", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}
