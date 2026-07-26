"use server";

import { updateTag } from "next/cache";

import { auth } from "@/lib/auth";
import { serverApi } from "@/lib/server-api";
import type { WatchStatus, ReadStatus } from "@tsuki/api/src/modules/users/model";

export async function logAnimeAction(
  animeId: number,
  data: {
    status?: WatchStatus;
    rating?: number;
    episodesWatched?: number;
    isFavorite?: boolean;
  },
) {
  const { user } = await auth();
  if (!user || !user.username) throw new Error("Unauthorized");

  const api = await serverApi();
  const { error } = await api.users.me.library({ animeId }).post(data);
  if (error) {
    console.error("logAnimeAction error:", error);
    throw new Error("Failed to log anime: " + JSON.stringify(error));
  }

  updateTag(`profile-${user.username}-library`);
  updateTag(`profile-${user.username}-overview`);
}

export async function deleteLogAction(animeId: number) {
  const { user } = await auth();
  if (!user || !user.username) throw new Error("Unauthorized");

  const api = await serverApi();
  const { error } = await api.users.me.library({ animeId }).delete();
  if (error) {
    console.error("deleteLogAction error:", error);
    throw new Error("Failed to delete log: " + JSON.stringify(error));
  }

  updateTag(`profile-${user.username}-library`);
  updateTag(`profile-${user.username}-overview`);
}

export async function submitReviewAction(
  animeId: number,
  content: string,
  containsSpoilers: boolean,
) {
  const { user } = await auth();
  if (!user || !user.username) throw new Error("Unauthorized");

  const api = await serverApi();
  const { error } = await api.users.me.reviews({ animeId }).post({ content, containsSpoilers });
  if (error) {
    console.error("submitReviewAction error:", error);
    throw new Error("Failed to submit review: " + JSON.stringify(error));
  }

  updateTag(`profile-${user.username}-reviews`);
  updateTag(`profile-${user.username}-overview`);
}

export async function logMangaAction(
  mangaId: number,
  data: {
    status?: ReadStatus;
    rating?: number;
    chaptersRead?: number;
    isFavorite?: boolean;
  },
) {
  const { user } = await auth();
  if (!user || !user.username) throw new Error("Unauthorized");

  const api = await serverApi();
  const { error } = await api.users.me["manga-library"]({ mangaId }).post(data);
  if (error) {
    console.error("logMangaAction error:", error);
    throw new Error("Failed to log manga: " + JSON.stringify(error));
  }

  updateTag(`profile-${user.username}-manga-library`);
  updateTag(`profile-${user.username}-overview`);
}

export async function deleteMangaLogAction(mangaId: number) {
  const { user } = await auth();
  if (!user || !user.username) throw new Error("Unauthorized");

  const api = await serverApi();
  const { error } = await api.users.me["manga-library"]({ mangaId }).delete();
  if (error) {
    console.error("deleteMangaLogAction error:", error);
    throw new Error("Failed to delete log: " + JSON.stringify(error));
  }

  updateTag(`profile-${user.username}-manga-library`);
  updateTag(`profile-${user.username}-overview`);
}

export async function submitMangaReviewAction(
  mangaId: number,
  content: string,
  containsSpoilers: boolean,
) {
  const { user } = await auth();
  if (!user || !user.username) throw new Error("Unauthorized");

  const api = await serverApi();
  const { error } = await api.users.me["manga-reviews"]({ mangaId }).post({
    content,
    containsSpoilers,
  });
  if (error) {
    console.error("submitMangaReviewAction error:", error);
    throw new Error("Failed to submit review: " + JSON.stringify(error));
  }

  updateTag(`profile-${user.username}-manga-reviews`);
  updateTag(`profile-${user.username}-overview`);
}

// TODO: not sure about this revalidation
