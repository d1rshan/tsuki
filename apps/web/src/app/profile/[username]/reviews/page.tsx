import { notFound } from "next/navigation";

import { ReviewItem, MangaReviewItem } from "@/components/profile/profile-reviews";
import { ProfileMediaToggle } from "@/components/profile/profile-media-toggle";
import { getProfileReviews, getProfileMangaReviews } from "../queries";

export default async function ProfileReviewsPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const [{ data: reviews, error }, { data: mangaReviews, error: mangaError }] = await Promise.all([
    getProfileReviews(username),
    getProfileMangaReviews(username),
  ]);

  if (error || mangaError) {
    return notFound();
  }

  const animeContent =
    reviews.length === 0 ? (
      <div className="text-center py-20 text-muted-foreground">
        <p className="text-sm font-medium">This user hasn't written any anime reviews yet.</p>
      </div>
    ) : (
      <div className="flex flex-col gap-10">
        {reviews.map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </div>
    );

  const mangaContent =
    mangaReviews.length === 0 ? (
      <div className="text-center py-20 text-muted-foreground">
        <p className="text-sm font-medium">This user hasn't written any manga reviews yet.</p>
      </div>
    ) : (
      <div className="flex flex-col gap-10">
        {mangaReviews.map((review) => (
          <MangaReviewItem key={review.id} review={review} />
        ))}
      </div>
    );

  return (
    <div className="max-w-3xl pb-16">
      <ProfileMediaToggle anime={animeContent} manga={mangaContent} />
    </div>
  );
}
