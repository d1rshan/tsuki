import { Suspense } from "react";
import { notFound } from "next/navigation";

import { ProfileReviewsView } from "@/features/profile/views/profile-reviews-view";
import { parseProfileUsername } from "@/features/profile/utils";
import { Loader } from "@/shared/components/loader";

export default function Page({ params }: { params: Promise<{ username: string }> }) {
  return (
    <Suspense fallback={<Loader />}>
      <ReviewsContent params={params} />
    </Suspense>
  );
}

async function ReviewsContent({ params }: { params: Promise<{ username: string }> }) {
  const username = parseProfileUsername((await params).username);
  if (!username) notFound();

  return <ProfileReviewsView username={username} />;
}
