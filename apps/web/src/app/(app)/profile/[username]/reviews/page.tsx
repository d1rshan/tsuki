import { ProfileReviewsView } from "@/features/profile/views/profile-reviews-view";
import { requireValidUsername } from "@/features/profile/valid";

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const username = await requireValidUsername(params);
  return <ProfileReviewsView username={username} />;
}
