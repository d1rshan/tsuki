import { notFound } from "next/navigation";

import type { MediaType, Review } from "@tsuki/api/types";

import { MEDIA, MEDIA_TYPES } from "@/features/media/media";
import { ContentState } from "@/shared/components/content-state";

import { ProfileFilterLayout } from "../components/profile-filter-layout";
import type { ProfileFilterOption } from "../components/profile-filter-tabs";
import { ReviewItem } from "../components/profile-reviews";
import { getProfileReviews } from "../data";
import { searchParam, type ProfileSearchParams } from "../utils";

export async function ProfileReviewsView({
  searchParams,
  username,
}: {
  searchParams: Promise<ProfileSearchParams>;
  username: string;
}) {
  const [reviews, params] = await Promise.all([getProfileReviews(username), searchParams]);
  if (!reviews) notFound();

  const byType: Record<MediaType, Review[]> = {
    ANIME: reviews.filter((review) => review.mediaType === "ANIME"),
    MANGA: reviews.filter((review) => review.mediaType === "MANGA"),
  };

  if (reviews.length === 0) return <ContentState title="No reviews yet" />;

  const requested = searchParam(params, "type");
  const requestedValid = MEDIA_TYPES.some((type) => type === requested);
  const selected: MediaType = requestedValid
    ? (requested as MediaType)
    : byType.ANIME.length
      ? "ANIME"
      : "MANGA";

  const options: ProfileFilterOption[] = MEDIA_TYPES.map((type) => ({
    value: type,
    label: MEDIA[type].label,
    href: `/${username}/reviews?type=${type}`,
    count: byType[type].length,
  }));

  return (
    <ProfileFilterLayout label="Review media type" options={options} selected={selected}>
      {byType[selected].length === 0 ? (
        <ContentState title={`No ${MEDIA[selected].label.toLowerCase()} reviews yet`} />
      ) : (
        <div className="columns-1 gap-6 lg:columns-2">
          {byType[selected].map((review) => (
            <ReviewItem key={review.id} review={review} className="mb-6 break-inside-avoid" />
          ))}
        </div>
      )}
    </ProfileFilterLayout>
  );
}
