"use server";

import { updateTag } from "next/cache";

import type { MediaType } from "@tsuki/api/types";
import type { RichContent } from "@tsuki/rich-content";
import { validateRichContent } from "@tsuki/rich-content";

import { getServerApi } from "@/shared/lib/server-api";
import { getSession } from "@/shared/lib/session";

import { logMediaSchema, mediaIdSchema, mediaTypeSchema, type LogMediaInput } from "./schemas";

type ServerApi = Awaited<ReturnType<typeof getServerApi>>;

/**
 * Runs an authenticated mutation and revalidates the profile tags it affects.
 * `tag` is the profile-scoped suffix, e.g. "library".
 */
async function mediaAction(
  label: string,
  tag: "library" | "reviews",
  call: (api: ServerApi) => Promise<{ error: unknown }>,
) {
  const { user } = await getSession();
  if (!user || !user.username) throw new Error("Unauthorized");

  const { error } = await call(await getServerApi());
  if (error) {
    console.error(`${label} error:`, error);
    throw new Error(`${label} failed`);
  }

  updateTag(`profile-${user.username}-${tag}`);
  updateTag(`profile-${user.username}-overview`);
}

export async function logMediaAction(mediaType: MediaType, mediaId: number, data: LogMediaInput) {
  const type = mediaTypeSchema.parse(mediaType);
  const id = mediaIdSchema.parse(mediaId);
  const input = logMediaSchema.parse(data);

  await mediaAction("logMediaAction", "library", (api) =>
    api.me.library({ type })({ id }).put(input),
  );
}

export async function submitReviewAction(
  mediaType: MediaType,
  mediaId: number,
  content: RichContent,
) {
  const type = mediaTypeSchema.parse(mediaType);
  const id = mediaIdSchema.parse(mediaId);

  // Fail fast on invalid documents; the API re-validates as the boundary.
  const parsed = validateRichContent(content, "review");
  if (!parsed.ok) throw new Error(parsed.reason);

  await mediaAction("submitReviewAction", "reviews", (api) =>
    api.me.reviews({ type })({ id }).put({ content: parsed.value }),
  );
}

export async function deleteReviewAction(mediaType: MediaType, mediaId: number) {
  const type = mediaTypeSchema.parse(mediaType);
  const id = mediaIdSchema.parse(mediaId);

  await mediaAction("deleteReviewAction", "reviews", (api) =>
    api.me.reviews({ type })({ id }).delete(),
  );
}
