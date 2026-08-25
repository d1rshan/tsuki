import { notFound } from "next/navigation";

import type { MediaType, Review } from "@tsuki/api/types";

import { MEDIA } from "@/features/media/media";
import { ContentState } from "@/shared/components/content-state";

import { ProfileMediaToggle } from "../components/profile-media-toggle";
import { ReviewItem } from "../components/profile-reviews";
import { getProfileReviews } from "../data";

function ReviewsForType({ reviews, mediaType }: { reviews: Review[]; mediaType: MediaType }) {
  const matchingReviews = reviews.filter((review) => review.mediaType === mediaType);
  if (matchingReviews.length === 0)
    return <ContentState title={`No ${MEDIA[mediaType].label.toLowerCase()} reviews yet`} />;

  return (
    <div className="flex flex-col gap-10">
      {matchingReviews.map((review) => (
        <ReviewItem key={review.id} review={review} />
      ))}
    </div>
  );
}

export async function ProfileReviewsView({ username }: { username: string }) {
  const reviews = await getProfileReviews(username);
  if (!reviews) notFound();

  return (
    <div className="max-w-3xl pb-16">
      <ProfileMediaToggle
        anime={<ReviewsForType reviews={reviews} mediaType="ANIME" />}
        manga={<ReviewsForType reviews={reviews} mediaType="MANGA" />}
      />
    </div>
  );
}
