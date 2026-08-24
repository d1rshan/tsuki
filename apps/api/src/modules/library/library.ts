import { status } from "elysia";

import { activityDal, libraryDal } from "@tsuki/db";
import type { FeedActivitySnapshot } from "@tsuki/db";

import { ensureMedia } from "../media/cache";
import type { MediaType } from "../media/model";
import type { LibraryEntryInputModel } from "./model";

type LibraryEntryRow = NonNullable<Awaited<ReturnType<typeof libraryDal.getEntry>>>;

/**
 * The LOG card shows what the entry looked like when it was logged, so the
 * snapshot copies the viewer-facing fields of the saved entry.
 */
export function logSnapshot(
  entry: Pick<LibraryEntryRow, "status" | "score" | "progress" | "progressVolumes" | "repeat">,
): FeedActivitySnapshot {
  return {
    status: entry.status,
    score: entry.score,
    progress: entry.progress,
    progressVolumes: entry.progressVolumes,
    repeat: entry.repeat,
  };
}

/** Log media: creates or updates the entry, mirroring it into Activity. */
export async function logMedia(
  userId: string,
  mediaType: MediaType,
  mediaId: number,
  body: typeof LibraryEntryInputModel.static,
) {
  // Logging from a search result can be the first time we have seen this title.
  const media = await ensureMedia(mediaType, mediaId);
  if (!media) return status(404, { error: "Media not found" });

  await libraryDal.upsertEntry({ userId, mediaId, mediaType, ...body });

  const entry = await libraryDal.getEntry(userId, mediaId);
  if (!entry) return status(500, { error: "Failed to save entry" });

  await activityDal.upsertFeedActivity({
    actorId: userId,
    type: "LOG",
    sourceId: String(mediaId),
    mediaId,
    mediaType,
    snapshot: logSnapshot(entry),
  });

  return entry;
}

/** Removing a log removes its Activity with it. */
export async function removeEntry(userId: string, mediaId: number) {
  await Promise.all([
    libraryDal.deleteEntry(userId, mediaId),
    activityDal.deleteFeedActivity(userId, "LOG", String(mediaId)),
  ]);
}
