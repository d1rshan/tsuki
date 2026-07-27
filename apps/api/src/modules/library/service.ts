import { libraryDal } from "@tsuki/db";

import { toApiMediaType } from "../media/model";
import { toMediaCompact } from "../media/service";
import type { LibraryEntry } from "./model";

type LibraryRow = NonNullable<Awaited<ReturnType<typeof libraryDal.getEntry>>>;

export function toLibraryEntry(row: LibraryRow): LibraryEntry {
  return {
    mediaType: toApiMediaType(row.mediaType),
    mediaId: row.mediaId,
    media: row.media ? toMediaCompact(row.media) : null,
    status: row.status,
    score: row.score,
    progress: row.progress,
    progressVolumes: row.progressVolumes,
    repeat: row.repeat,
    isFavorite: row.isFavorite,
    notes: row.notes,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getUserLibrary(
  userId: string,
  options: Parameters<typeof libraryDal.getUserLibrary>[1],
) {
  const rows = await libraryDal.getUserLibrary(userId, options);
  return rows.map(toLibraryEntry);
}

export async function getEntry(userId: string, mediaId: number) {
  const row = await libraryDal.getEntry(userId, mediaId);
  return row ? toLibraryEntry(row) : null;
}
