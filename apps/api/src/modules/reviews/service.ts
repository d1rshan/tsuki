import { status } from "elysia";

import { activityDal, reviewsDal } from "@tsuki/db";

import { ensureMedia } from "../media/service";
import type { MediaType } from "../media/model";
import type { ReviewInputModel } from "./model";

/** The REVIEW card carries the review text and its spoiler state. */
function reviewSnapshot(review: { content: string; containsSpoilers: boolean }) {
  return { content: review.content, containsSpoilers: review.containsSpoilers };
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

  await reviewsDal.upsertReview({
    userId,
    mediaId,
    mediaType,
    content: body.content,
    containsSpoilers: body.containsSpoilers ?? false,
  });

  const review = await reviewsDal.getReview(userId, mediaId);
  if (!review) return status(500, { error: "Failed to save review" });

  await activityDal.upsertFeedActivity({
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
    activityDal.deleteFeedActivity(userId, "REVIEW", String(mediaId)),
  ]);
}
