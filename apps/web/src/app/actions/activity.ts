"use server";

import { updateTag } from "next/cache";

import { auth } from "@/lib/auth";
import { serverApi } from "@/lib/server-api";
import type { WatchStatus, ReadStatus } from "@tsuki/api/src/modules/users/model";

type ServerApi = Awaited<ReturnType<typeof serverApi>>;

/**
 * Runs an authenticated mutation against the API and revalidates the profile
 * tags it affects. `tag` is the profile-scoped suffix, e.g. "manga-library".
 */
async function mediaAction(
  label: string,
  tag: string,
  call: (api: ServerApi) => Promise<{ error: unknown }>,
) {
  const { user } = await auth();
  if (!user || !user.username) throw new Error("Unauthorized");

  const { error } = await call(await serverApi());
  if (error) {
    console.error(`${label} error:`, error);
    throw new Error(`${label} failed: ` + JSON.stringify(error));
  }

  updateTag(`profile-${user.username}-${tag}`);
  updateTag(`profile-${user.username}-overview`);
}

export async function logAnimeAction(
  animeId: number,
  data: {
    status?: WatchStatus;
    rating?: number;
    episodesWatched?: number;
    isFavorite?: boolean;
  },
) {
  await mediaAction("logAnimeAction", "library", (api) =>
    api.users.me.library({ animeId }).post(data),
  );
}

export async function deleteLogAction(animeId: number) {
  await mediaAction("deleteLogAction", "library", (api) =>
    api.users.me.library({ animeId }).delete(),
  );
}

export async function submitReviewAction(
  animeId: number,
  content: string,
  containsSpoilers: boolean,
) {
  await mediaAction("submitReviewAction", "reviews", (api) =>
    api.users.me.reviews({ animeId }).post({ content, containsSpoilers }),
  );
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
  await mediaAction("logMangaAction", "manga-library", (api) =>
    api.users.me["manga-library"]({ mangaId }).post(data),
  );
}

export async function deleteMangaLogAction(mangaId: number) {
  await mediaAction("deleteMangaLogAction", "manga-library", (api) =>
    api.users.me["manga-library"]({ mangaId }).delete(),
  );
}

export async function submitMangaReviewAction(
  mangaId: number,
  content: string,
  containsSpoilers: boolean,
) {
  await mediaAction("submitMangaReviewAction", "manga-reviews", (api) =>
    api.users.me["manga-reviews"]({ mangaId }).post({ content, containsSpoilers }),
  );
}

// TODO: not sure about this revalidation
