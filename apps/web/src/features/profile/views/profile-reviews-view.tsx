import { Suspense } from "react";
import { notFound } from "next/navigation";

import type { MediaType, Review } from "@tsuki/api/types";

import { MEDIA } from "@/features/media/media";
import { ProfileMediaToggle } from "@/features/profile/components/profile-media-toggle";
import { ReviewItem } from "@/features/profile/components/profile-reviews";
import { Loader } from "@/shared/components/loader";
import { ContentState } from "@/shared/components/content-state";

import { getProfileReviews } from "../data";

function ReviewsForType({ reviews, mediaType }: { reviews: Review[]; mediaType: MediaType }) {
  const matchingReviews = reviews.filter((review) => review.mediaType === mediaType);

  if (matchingReviews.length === 0) {
    return <ContentState title={`No ${MEDIA[mediaType].label.toLowerCase()} reviews yet`} />;
  }

  return (
    <div className="flex flex-col gap-10">
      {matchingReviews.map((review) => (
        <ReviewItem key={review.id} review={review} />
      ))}
    </div>
  );
}

export function ProfileReviewsView({ username }: { username: string }) {
  return (
    <Suspense fallback={<Loader />}>
      <ProfileReviewsContent username={username} />
    </Suspense>
  );
}

async function ProfileReviewsContent({ username }: { username: string }) {
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
