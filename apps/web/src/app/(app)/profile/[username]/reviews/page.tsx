import { ProfileReviewsView } from "@/features/profile/views/profile-reviews-view";

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return <ProfileReviewsView username={username} />;
}
