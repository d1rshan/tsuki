import type { LibraryEntry, ListStatus, MediaType, Review } from "@tsuki/api/types";
import type { RichContent } from "@tsuki/rich-content";

import type { LogMediaInput } from "./schemas";
import { MEDIA } from "./media";

export type ActivityForm = {
  progress: string;
  progressDate?: string;
  startedDate?: string;
  completedDate?: string;
  /** Rich Content document (review preset); null when the author wrote nothing. */
  review: RichContent | null;
  score: number;
  status: ListStatus;
};

export const SCORE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export function clampProgress(value: number, total?: number | null) {
  const progress = Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
  return typeof total === "number" && total > 0 ? Math.min(progress, total) : progress;
}

export function completionStatus(
  progress: number,
  total: number | null | undefined,
  selected: ListStatus,
): ListStatus {
  return total != null && total > 0 && progress >= total ? "COMPLETED" : selected;
}

export function createActivityForm(
  mediaType: MediaType,
  entry: LibraryEntry | null,
  review: Review | null,
  total?: number | null,
): ActivityForm {
  return {
    progressDate: localDay(),
    startedDate: entry?.startedAt ? fuzzyInput(entry.startedAt) : localDay(),
    completedDate: fuzzyInput(entry?.completedAt),
    progress: entry ? String(entry.progress) : "0",
    review: review?.content ?? null,
    score: entry?.score ?? 0,
    status: completionStatus(
      entry?.progress ?? 0,
      total,
      entry?.status ?? MEDIA[mediaType].defaultStatus,
    ),
  };
}

export function createLogMediaInput(
  form: ActivityForm,
  isFavorite: boolean,
  total?: number | null,
): LogMediaInput {
  return {
    status: completionStatus(
      clampProgress(Number.parseInt(form.progress, 10), total),
      total,
      form.status,
    ),
    score: form.score || null,
    progress: clampProgress(Number.parseInt(form.progress, 10), total),
    isFavorite,
    progressDate: form.progressDate || null,
    startedAt: parseSummary(form.startedDate),
    completedAt: parseSummary(form.completedDate),
  };
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

export function localDay() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}
function fuzzyInput(
  d: { year?: number | null; month?: number | null; day?: number | null } | null | undefined,
) {
  return d?.year && d.month && d.day
    ? [d.year, String(d.month).padStart(2, "0"), String(d.day).padStart(2, "0")].join("-")
    : d
      ? undefined
      : "";
}
function parseSummary(s?: string) {
  if (s === undefined) return undefined;
  if (!s) return null;
  const [year, month, day] = s.split("-").map(Number);
  return year && month && day ? { year, month, day } : null;
}
