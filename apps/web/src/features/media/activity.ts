import type { LibraryEntry, ListStatus, MediaType, Review } from "@tsuki/api/types";

import type { LogMediaInput } from "./schemas";
import { MEDIA } from "./media";

export type ActivityForm = {
  containsSpoilers: boolean;
  progress: string;
  reviewContent: string;
  score: number;
  status: ListStatus;
};

export const SCORE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export function clampProgress(value: number, total?: number | null) {
  const progress = Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
  return typeof total === "number" && total > 0 ? Math.min(progress, total) : progress;
}

export function createActivityForm(
  mediaType: MediaType,
  entry: LibraryEntry | null,
  review: Review | null,
): ActivityForm {
  return {
    containsSpoilers: review?.containsSpoilers ?? false,
    progress: entry ? String(entry.progress) : "0",
    reviewContent: review?.content ?? "",
    score: entry?.score ?? 0,
    status: entry?.status ?? MEDIA[mediaType].defaultStatus,
  };
}

export function createLogMediaInput(
  form: ActivityForm,
  isFavorite: boolean,
  total?: number | null,
): LogMediaInput {
  return {
    status: form.status,
    score: form.score || null,
    progress: clampProgress(Number.parseInt(form.progress, 10), total),
    isFavorite,
  };
}

export function createFavoriteInput(isFavorite: boolean): LogMediaInput {
  return { isFavorite };
}

export function hasLoggedActivity(
  mediaType: MediaType,
  entry: LibraryEntry | null,
  review: Review | null,
) {
  return Boolean(
    review ||
    entry?.score ||
    (entry?.progress && entry.progress > 0) ||
    (entry?.status && entry.status !== MEDIA[mediaType].defaultStatus),
  );
}

export async function saveMediaActivity(
  saveLog: () => Promise<void>,
  saveReview: () => Promise<void>,
): Promise<"saved" | "review-failed"> {
  await saveLog();

  try {
    await saveReview();
    return "saved";
  } catch {
    return "review-failed";
  }
}
