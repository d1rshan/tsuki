import { ProfileReviewsView } from "@/features/profile/views/profile-reviews-view";

export default function Page({ params }: { params: Promise<{ username: string }> }) {
  return <ProfileReviewsView params={params} />;
}
