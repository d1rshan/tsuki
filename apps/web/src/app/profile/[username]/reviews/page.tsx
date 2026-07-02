import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ReviewItem } from "@/components/profile/profile-reviews";
import { getProfileReviews } from "../queries";

export default async function ProfileReviewsPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  return (
    <div className="max-w-3xl space-y-8 pb-16">
      <h2 className="text-2xl font-bold tracking-tight">Reviews</h2>
      <Suspense
        fallback={
          <div className="py-20 flex justify-center">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <ReviewsContent username={username} />
      </Suspense>
    </div>
  );
}

async function ReviewsContent({ username }: { username: string }) {
  const { data: reviews, error } = await getProfileReviews(username);

  if (error) {
    return notFound();
  }

  return (
    <>
      {reviews.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-sm font-medium">This user hasn't written any reviews yet.</p>
        </div>
      )}

      <div className="flex flex-col gap-10">
        {reviews.map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </div>
    </>
  );
}
