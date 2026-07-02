"use server";

import { revalidateTag } from "next/cache";

import { api } from "@/lib/api";

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
    const res = await api.users["me"].profile.put(data);

    if (res.error) {
      return { success: false, error: "Failed to update profile. Please check your inputs." };
    }

    revalidateTag(`profile-${username}`, "max");
    return { success: true, error: null };
  } catch (error) {
    console.error("Failed to update profile", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}
