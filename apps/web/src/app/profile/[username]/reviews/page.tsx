import { notFound } from "next/navigation";

import { ReviewItem, MangaReviewItem } from "@/components/profile/profile-reviews";
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

  return (
    <div className="max-w-3xl space-y-12 pb-16">
      <div className="space-y-8">
        <h2 className="text-2xl font-bold tracking-tight">Anime Reviews</h2>

        {reviews.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-sm font-medium">This user hasn't written any anime reviews yet.</p>
          </div>
        )}

        <div className="flex flex-col gap-10">
          {reviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </div>
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-bold tracking-tight">Manga Reviews</h2>

        {mangaReviews.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-sm font-medium">This user hasn't written any manga reviews yet.</p>
          </div>
        )}

        <div className="flex flex-col gap-10">
          {mangaReviews.map((review) => (
            <MangaReviewItem key={review.id} review={review} />
          ))}
        </div>
      </div>
    </div>
  );
}
