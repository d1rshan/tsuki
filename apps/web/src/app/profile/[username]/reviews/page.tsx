import { notFound } from "next/navigation";

import type { MediaType, Review } from "@tsuki/api/types";

import { MEDIA } from "@/modules/media/config";
import { ReviewItem } from "@/modules/profile/components/profile-reviews";
import { ProfileMediaToggle } from "@/modules/profile/components/profile-media-toggle";
import { getProfileReviews } from "@/modules/profile/queries";

function ReviewsForType({ reviews, mediaType }: { reviews: Review[]; mediaType: MediaType }) {
  const forType = reviews.filter((review) => review.mediaType === mediaType);

  if (forType.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="text-sm font-medium">
          This user hasn&apos;t written any {MEDIA[mediaType].label.toLowerCase()} reviews yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {forType.map((review) => (
        <ReviewItem key={review.id} review={review} />
      ))}
    </div>
  );
}

export default async function ProfileReviewsPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const { data, error } = await getProfileReviews(username);

  if (error || !data) return notFound();

  return (
    <div className="max-w-3xl pb-16">
      <ProfileMediaToggle
        anime={<ReviewsForType reviews={data} mediaType="ANIME" />}
        manga={<ReviewsForType reviews={data} mediaType="MANGA" />}
      />
    </div>
  );
}
