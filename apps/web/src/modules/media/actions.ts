"use server";

import { updateTag } from "next/cache";

import type { ListStatus, MediaType } from "@tsuki/api/types";

import { auth } from "@/lib/auth";
import { serverApi } from "@/lib/server-api";

type ServerApi = Awaited<ReturnType<typeof serverApi>>;

/**
 * Runs an authenticated mutation and revalidates the profile tags it affects.
 * `tag` is the profile-scoped suffix, e.g. "library".
 */
async function mediaAction(
  label: string,
  tag: "library" | "reviews",
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

export type LogMediaInput = {
  status?: ListStatus;
  score?: number | null;
  /** Episodes watched or chapters read. */
  progress?: number;
  isFavorite?: boolean;
};

export async function logMediaAction(mediaType: MediaType, mediaId: number, data: LogMediaInput) {
  await mediaAction("logMediaAction", "library", (api) =>
    api.me.library({ type: mediaType })({ id: mediaId }).put(data),
  );
}

export async function deleteLogAction(mediaType: MediaType, mediaId: number) {
  await mediaAction("deleteLogAction", "library", (api) =>
    api.me.library({ type: mediaType })({ id: mediaId }).delete(),
  );
}

export async function submitReviewAction(
  mediaType: MediaType,
  mediaId: number,
  content: string,
  containsSpoilers: boolean,
) {
  await mediaAction("submitReviewAction", "reviews", (api) =>
    api.me.reviews({ type: mediaType })({ id: mediaId }).put({ content, containsSpoilers }),
  );
}

export async function deleteReviewAction(mediaType: MediaType, mediaId: number) {
  await mediaAction("deleteReviewAction", "reviews", (api) =>
    api.me.reviews({ type: mediaType })({ id: mediaId }).delete(),
  );
}
