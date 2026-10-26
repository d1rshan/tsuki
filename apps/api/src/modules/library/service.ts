import { status } from "elysia";

import { activityDal, libraryDal } from "@tsuki/db";
import type { ActivitySnapshot } from "@tsuki/db";

import { ensureMedia } from "../media/service";
import type { MediaType } from "../media/model";
import type { LibraryEntryInputModel } from "./model";

type TrackingState = Pick<
  NonNullable<Awaited<ReturnType<typeof libraryDal.getEntry>>>,
  "status" | "progress"
>;

/** Normalize before writing or evaluating Activity, including partial saves. */
export function completedStatus(
  progress: number,
  total: number | null | undefined,
  selected: TrackingState["status"],
): TrackingState["status"] {
  return total != null && total > 0 && progress >= total ? "COMPLETED" : selected;
}

/** An excluded-field save or correction leaves today's card entirely untouched. */
export function logSnapshot(
  entry: TrackingState,
  before: TrackingState | undefined,
  today?: ActivitySnapshot,
): ActivitySnapshot | null {
  const increased = entry.progress > (before?.progress ?? 0);
  const changedStatus = entry.status !== (before?.status ?? null);
  if (!increased && !changedStatus) return null;

  const snapshot: ActivitySnapshot = { status: entry.status };
  // Allowlist even when today's row predates the cleanup.
  if (today?.statusFrom !== undefined) snapshot.statusFrom = today.statusFrom;
  if (changedStatus || today?.statusChanged === true) snapshot.statusChanged = true;
  if (
    today?.progress != null &&
    today.progressFrom !== undefined &&
    (today.progressFrom === null || today.progress > today.progressFrom)
  ) {
    snapshot.progress = today.progress;
    snapshot.progressFrom = today.progressFrom;
  }
  if (increased) {
    // A correction resets the next increase's baseline. Never claim the
    // corrected-away progress was earned by the later save.
    const reset = today?.progress != null && (before?.progress ?? 0) < today.progress;
    snapshot.progress = entry.progress;
    if (reset || snapshot.progressFrom === undefined) {
      if (before) snapshot.progressFrom = before.progress;
      else snapshot.progressFrom = null;
    }
  }
  if (changedStatus && !Object.hasOwn(snapshot, "statusFrom")) {
    snapshot.statusFrom = before?.status ?? null;
  }
  return snapshot;
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
  // The catalogue is authoritative for completion totals.
  const media = await ensureMedia(mediaType, mediaId);
  if (!media) return status(404, { error: "Media not found" });

  const before = await libraryDal.getEntry(userId, mediaId);
  const effectiveStatus = completedStatus(
    body.progress ?? before?.progress ?? 0,
    mediaType === "ANIME" ? media.episodes : media.chapters,
    body.status ?? before?.status ?? null,
  );
  await libraryDal.upsertEntry({ userId, mediaId, mediaType, ...body, status: effectiveStatus });

  const entry = await libraryDal.getEntry(userId, mediaId);
  if (!entry) return status(500, { error: "Failed to save entry" });

  // One timestamp for both the day key and the card, so a save that lands at
  // the UTC midnight boundary keys and stamps the same day.
  const now = new Date();
  const sourceId = logSourceId(mediaId, now);

  // ponytail: the existing HTTP DAL uses read-modify-write; concurrent saves
  // to the same entry can race. Move this write into a DB function if needed.
  const today = await activityDal.getLog(userId, sourceId);
  const snapshot = logSnapshot(entry, before, today?.snapshot);
  if (snapshot) {
    await activityDal.upsertActivity({
      actorId: userId,
      type: "LOG",
      sourceId,
      mediaId,
      mediaType,
      occurredAt: now,
      snapshot,
    });
  }

  return entry;
}

/** Removing an entry removes all of its Log cards (one per logged day). */
export async function removeEntry(userId: string, mediaId: number) {
  await Promise.all([
    libraryDal.deleteEntry(userId, mediaId),
    activityDal.deleteActivityLogs(userId, mediaId),
  ]);
}
