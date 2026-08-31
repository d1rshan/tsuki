import { status } from "elysia";

import { activityDal, reviewsDal } from "@tsuki/db";
import type { RichContent } from "@tsuki/rich-content";
import { isEmptyRichContent, validateRichContent } from "@tsuki/rich-content";

import { ensureMedia } from "../media/service";
import type { MediaType } from "../media/model";
import type { ReviewInputModel } from "./model";

/** The REVIEW card carries the review's Rich Content; spoilers live inside it. */
export function reviewSnapshot(review: { content: RichContent }) {
  return { content: review.content };
}

/** Submit a review: creates or replaces it, mirroring it into Activity. */
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

  await activityDal.upsertActivity({
    actorId: userId,
    type: "REVIEW",
    sourceId: String(mediaId),
    mediaId,
    mediaType,
    snapshot: reviewSnapshot(review),
  });

  return review;
}

/** Removing a review removes its Activity with it. */
export async function removeReview(userId: string, mediaId: number) {
  await Promise.all([
    reviewsDal.deleteReview(userId, mediaId),
    activityDal.deleteActivity(userId, "REVIEW", String(mediaId)),
  ]);
}
