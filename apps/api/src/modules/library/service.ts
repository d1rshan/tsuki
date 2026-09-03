import { status } from "elysia";

import { activityDal, libraryDal } from "@tsuki/db";
import type { ActivitySnapshot } from "@tsuki/db";

import { ensureMedia } from "../media/service";
import type { MediaType } from "../media/model";
import type { LibraryEntryInputModel } from "./model";

/**
 * The LOG card shows what the entry looked like when it was logged, so the
 * snapshot copies the viewer-facing fields of the saved entry — plus the
 * baseline the day's progress range opened from, when there is one.
 *
 * `priors` is the actor's most recent Log cards for the media, newest first
 * (today's row, when it exists, leads). Days whose save had no progress are
 * skipped as baselines by that search naturally: their snapshots carry none.
 */
export function logSnapshot(
  entry: {
    status: "CURRENT" | "PLANNING" | "COMPLETED" | "DROPPED" | "PAUSED" | "REPEATING" | null;
    score: number | null;
    progress: number;
    progressVolumes: number | null;
    repeat: number;
  },
  priors: { sourceId: string; snapshot: ActivitySnapshot }[],
  todaySourceId: string,
): ActivitySnapshot {
  const opened = priors[0];
  const sameDay = opened?.sourceId === todaySourceId;
  const priorDays = sameDay ? priors.slice(1) : priors;

  const snapshot: ActivitySnapshot = {
    status: entry.status,
    score: entry.score,
    repeat: entry.repeat,
  };
  // Progress rides along only when the save moved it, so a score-only day's
  // card reads "rated" and never becomes the next day's baseline.
  const lastProgress = priorDays.find((p) => p.snapshot.progress != null)?.snapshot.progress;
  if (sameDay || entry.progress !== lastProgress) snapshot.progress = entry.progress;
  snapshot.progressVolumes = entry.progressVolumes;

  if (opened && sameDay) {
    // The day's range keeps the baselines it opened with, so re-logs extend it.
    if (opened.snapshot.progressFrom != null) snapshot.progressFrom = opened.snapshot.progressFrom;
    if (opened.snapshot.progressVolumesFrom != null) {
      snapshot.progressVolumesFrom = opened.snapshot.progressVolumesFrom;
    }
  }

  // An axis the day's first save never opened (a score-only or volume-only
  // save stored none) derives its baseline from the prior days, with the same
  // correction guard as a new day: no range for corrections or first-ever logs.
  const chapterBaseline = snapshot.progressFrom ?? lastMoved(priorDays, (s) => s.progress);
  if (chapterBaseline != null && entry.progress > chapterBaseline) {
    snapshot.progressFrom = chapterBaseline;
  }
  const volumeBaseline =
    snapshot.progressVolumesFrom ?? lastMoved(priorDays, (s) => s.progressVolumes);
  if (volumeBaseline != null && (entry.progressVolumes ?? 0) > volumeBaseline) {
    snapshot.progressVolumesFrom = volumeBaseline;
  }
  return snapshot;
}

/** The last value an axis moved to across the prior days, searching newest-first. */
function lastMoved(
  priorDays: { snapshot: ActivitySnapshot }[],
  axis: (snapshot: ActivitySnapshot) => number | null | undefined,
): number | undefined {
  for (const { snapshot } of priorDays) {
    const value = axis(snapshot);
    if (value != null && value > 0) return value;
  }
  return undefined;
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
  const sourceId = logSourceId(mediaId, now);

  await activityDal.upsertActivity({
    actorId: userId,
    type: "LOG",
    sourceId,
    mediaId,
    mediaType,
    // The latest save of the day owns the card's timestamp and state.
    occurredAt: now,
    snapshot: logSnapshot(entry, await activityDal.getRecentLogs(userId, mediaId), sourceId),
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
