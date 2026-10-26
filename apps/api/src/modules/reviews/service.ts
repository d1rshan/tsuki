import { status } from "elysia";

import { reviewsDal } from "@tsuki/db";
import { isEmptyRichContent, validateRichContent } from "@tsuki/rich-content";

import { ensureMedia } from "../media/service";
import type { MediaType } from "../media/model";
import type { ReviewInputModel } from "./model";

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
