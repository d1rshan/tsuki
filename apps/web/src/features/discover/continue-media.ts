import type { LibraryEntry, MediaType } from "@tsuki/api/types";

import { unitCount } from "@/features/media/media";
import type { LogMediaInput } from "@/features/media/schemas";

export type ContinueEntry = LibraryEntry & { media: NonNullable<LibraryEntry["media"]> };

export function getContinueEntries(
  entries: LibraryEntry[],
  mediaType: MediaType,
  limit: number,
): ContinueEntry[] {
  return entries
    .filter((entry): entry is ContinueEntry => {
      if (entry.mediaType !== mediaType || entry.status !== "CURRENT" || !entry.media) return false;

      const total = unitCount(entry.media);
      return !total || entry.progress < total;
    })
    .slice(0, limit);
}

export function createContinueLogInput(progress: number, total: number | null): LogMediaInput {
  const nextProgress = progress + 1;

  return {
    progress: nextProgress,
    status: total && nextProgress >= total ? "COMPLETED" : undefined,
  };
}
