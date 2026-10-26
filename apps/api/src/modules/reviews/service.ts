import { status } from "elysia";

import { reviewsDal } from "@tsuki/db";
import { isEmptyRichContent, validateRichContent } from "@tsuki/rich-content";

import { ensureMedia } from "../media/service";
import type { MediaType } from "../media/model";
import type { ReviewInputModel } from "./model";

type ReviewCursor = { createdAt: Date; id: string };

/** Invalid cursors restart at the newest review, matching Activity pagination. */
export function parseReviewCursor(raw?: string | null): ReviewCursor | undefined {
  const [createdAt, id] = raw?.split("|") ?? [];
  if (!createdAt || !id || Number.isNaN(Date.parse(createdAt))) return undefined;
  return { createdAt: new Date(createdAt), id };
}

export function encodeReviewCursor(cursor: ReviewCursor | null): string | null {
  return cursor ? `${cursor.createdAt.toISOString()}|${cursor.id}` : null;
}

export async function getReviewFeed(query: { cursor?: string; limit?: number }, viewerId?: string) {
  const page = await reviewsDal.getRecentReviews({
    viewerId,
    cursor: parseReviewCursor(query.cursor),
    limit: query.limit ?? 5,
  });
  return { reviews: page.reviews, nextCursor: encodeReviewCursor(page.nextCursor) };
}

/** Submit a review: creates or replaces its full Rich Content document. */
export async function submitReview(
  userId: string,
  mediaType: MediaType,
  mediaId: number,
  body: typeof ReviewInputModel.static,
) {
  const media = await ensureMedia(mediaType, mediaId);
  if (!media) return status(404, { error: "Media not found" });

  // The editor is not a security boundary: the API owns Rich Content policy.
  const parsed = validateRichContent(body.content, "review");
  if (!parsed.ok) return status(422, { error: parsed.reason });
  // Reviews are required content — a hand-crafted empty document is not one.
  if (isEmptyRichContent(parsed.value)) {
    return status(422, { error: "Review content is required" });
  }

  await reviewsDal.upsertReview({
    userId,
    mediaId,
    mediaType,
    content: parsed.value,
  });

  const review = await reviewsDal.getReview(userId, mediaId);
  if (!review) return status(500, { error: "Failed to save review" });

  return review;
}

/** Remove the review itself. */
export async function removeReview(userId: string, mediaId: number) {
  await reviewsDal.deleteReview(userId, mediaId);
}
