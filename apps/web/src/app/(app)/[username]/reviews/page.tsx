import { notFound } from "next/navigation";

import { ProfileReviewsView } from "@/features/profile/views/profile-reviews-view";
import { parseProfileUsername } from "@/features/profile/utils";

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const username = parseProfileUsername((await params).username);
  if (!username) notFound();

  return <ProfileReviewsView username={username} />;
}
