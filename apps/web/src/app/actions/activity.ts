"use server";

import { revalidateTag } from "next/cache";

import { serverApi } from "@/lib/api";
import type { WatchStatus } from "@tsuki/api/src/modules/activity/model";

export async function logAnimeAction(
  username: string,
  animeId: number,
  data: {
    status?: WatchStatus;
    rating?: number;
    episodesWatched?: number;
    isFavorite?: boolean;
  },
) {
  const api = await serverApi();
  const { error } = await api.users.me.library({ animeId }).post(data);
  if (error) {
    console.error("logAnimeAction error:", error);
    throw new Error("Failed to log anime: " + JSON.stringify(error));
  }

  revalidateTag(`profile-${username}-library`, "max");
  revalidateTag(`profile-${username}-overview`, "max");
  revalidateTag(`activity-${username}-${animeId}`, "max");
}

export async function deleteLogAction(username: string, animeId: number) {
  const api = await serverApi();
  const { error } = await api.users.me.library({ animeId }).delete();
  if (error) {
    console.error("deleteLogAction error:", error);
    throw new Error("Failed to delete log: " + JSON.stringify(error));
  }

  revalidateTag(`profile-${username}-library`, "max");
  revalidateTag(`profile-${username}-overview`, "max");
  revalidateTag(`activity-${username}-${animeId}`, "max");
}

export async function submitReviewAction(
  username: string,
  animeId: number,
  content: string,
  containsSpoilers: boolean,
) {
  const api = await serverApi();
  const { error } = await api.users.me.reviews({ animeId }).post({ content, containsSpoilers });
  if (error) {
    console.error("submitReviewAction error:", error);
    throw new Error("Failed to submit review: " + JSON.stringify(error));
  }

  revalidateTag(`profile-${username}-reviews`, "max");
  revalidateTag(`profile-${username}-overview`, "max");
  revalidateTag(`activity-${username}-${animeId}`, "max");
}

// TODO: not sure about this revalidation
