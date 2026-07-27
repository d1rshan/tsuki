import { reviewsDal } from "@tsuki/db";

import { toApiMediaType } from "../media/model";
import { toMediaCompact } from "../media/service";
import type { Review } from "./model";

type ReviewRow = NonNullable<Awaited<ReturnType<typeof reviewsDal.getReview>>>;

export function toReview(row: ReviewRow): Review {
  return {
    id: row.id,
    mediaType: toApiMediaType(row.mediaType),
    mediaId: row.mediaId,
    media: row.media ? toMediaCompact(row.media) : null,
    content: row.content,
    containsSpoilers: row.containsSpoilers,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getUserReviews(
  userId: string,
  options: Parameters<typeof reviewsDal.getUserReviews>[1],
) {
  const rows = await reviewsDal.getUserReviews(userId, options);
  return rows.map(toReview);
}

export async function getReview(userId: string, mediaId: number) {
  const row = await reviewsDal.getReview(userId, mediaId);
  return row ? toReview(row) : null;
}
