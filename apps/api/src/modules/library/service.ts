import { status } from "elysia";

import { activityDal, libraryDal } from "@tsuki/db";
import type { ActivitySnapshot } from "@tsuki/db";

import { ensureMedia } from "../media/service";
import type { MediaType } from "../media/model";
import type { LibraryEntryInputModel } from "./model";

/**
 * The LOG card shows what the entry looked like when it was logged, so the
 * snapshot copies the viewer-facing fields of the saved entry.
 */
export function logSnapshot(entry: {
  status: "CURRENT" | "PLANNING" | "COMPLETED" | "DROPPED" | "PAUSED" | "REPEATING" | null;
  score: number | null;
  progress: number;
  progressVolumes: number | null;
  repeat: number;
}): ActivitySnapshot {
  return {
    status: entry.status,
    score: entry.score,
    progress: entry.progress,
    progressVolumes: entry.progressVolumes,
    repeat: entry.repeat,
  };
}

/**
 * A Log is one card per media per UTC day: same-day re-logs upsert, a new UTC
 * day starts a new card. Day boundary matches the progress rollup and heatmap.
 */
export function logSourceId(mediaId: number, at: Date) {
  return `${mediaId}:${at.toISOString().slice(0, 10)}`;
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

  // One timestamp for both the day key and the card, so a save that lands at
  // the UTC midnight boundary keys and stamps the same day.
  const now = new Date();

  await activityDal.upsertActivity({
    actorId: userId,
    type: "LOG",
    sourceId: logSourceId(mediaId, now),
    mediaId,
    mediaType,
    // The latest save of the day owns the card's timestamp and state.
    occurredAt: now,
    snapshot: logSnapshot(entry),
  });

  return entry;
}

/** Removing an entry removes all of its Log cards (one per logged day). */
export async function removeEntry(userId: string, mediaId: number) {
  await Promise.all([
    libraryDal.deleteEntry(userId, mediaId),
    activityDal.deleteActivityLogs(userId, mediaId),
  ]);
}
