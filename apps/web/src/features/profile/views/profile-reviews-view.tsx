import { notFound } from "next/navigation";

import type { MediaType, Review } from "@tsuki/api/types";

import { MEDIA } from "@/features/media/media";
import { ContentState } from "@/shared/components/content-state";

import { ProfileSection } from "../components/profile-section";
import { ReviewItem } from "../components/profile-reviews";
import { getProfileReviews } from "../data";

function ReviewsForType({ reviews, mediaType }: { reviews: Review[]; mediaType: MediaType }) {
  const matchingReviews = reviews.filter((review) => review.mediaType === mediaType);

  return (
    <ProfileSection title={`${MEDIA[mediaType].label} Reviews`} count={matchingReviews.length}>
      {matchingReviews.length === 0 ? (
        <ContentState title={`No ${MEDIA[mediaType].label.toLowerCase()} reviews yet`} />
      ) : (
        <div className="flex flex-col gap-10">
          {matchingReviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </div>
      )}
    </ProfileSection>
  );
}

export async function ProfileReviewsView({ username }: { username: string }) {
  const reviews = await getProfileReviews(username);
  if (!reviews) notFound();

  return (
    <div className="max-w-3xl space-y-16 pb-16">
      <ReviewsForType reviews={reviews} mediaType="ANIME" />
      <ReviewsForType reviews={reviews} mediaType="MANGA" />
    </div>
  );
}
