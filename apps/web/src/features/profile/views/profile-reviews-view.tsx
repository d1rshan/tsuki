import { Suspense } from "react";
import { notFound } from "next/navigation";

import type { MediaType, Review } from "@tsuki/api/types";

import { MEDIA } from "@/features/media/media";
import { ProfileMediaToggle } from "@/features/profile/components/profile-media-toggle";
import { ReviewItem } from "@/features/profile/components/profile-reviews";
import { LoadingIndicator } from "@/shared/components/loading-indicator";
import { parseUsername } from "@/shared/lib/username";

import { getProfileReviews } from "../data";

function ReviewsForType({ reviews, mediaType }: { reviews: Review[]; mediaType: MediaType }) {
  const matchingReviews = reviews.filter((review) => review.mediaType === mediaType);

  if (matchingReviews.length === 0) {
    return (
      <p className="py-20 text-center text-sm text-muted-foreground">
        This user hasn&apos;t written any {MEDIA[mediaType].label.toLowerCase()} reviews yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {matchingReviews.map((review) => (
        <ReviewItem key={review.id} review={review} />
      ))}
    </div>
  );
}

export function ProfileReviewsView({ params }: { params: Promise<{ username: string }> }) {
  return (
    <Suspense fallback={<LoadingIndicator label="Loading reviews" />}>
      <ProfileReviewsContent params={params} />
    </Suspense>
  );
}

async function ProfileReviewsContent({ params }: { params: Promise<{ username: string }> }) {
  const username = parseUsername((await params).username);
  if (!username) notFound();

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
