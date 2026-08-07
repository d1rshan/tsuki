import { MediaDetailsPage, getMediaMetadata } from "@/features/media/pages/media-details-page";

export function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return getMediaMetadata("ANIME", params);
}

export default function AnimePage({ params }: { params: Promise<{ id: string }> }) {
  return <MediaDetailsPage mediaType="ANIME" params={params} />;
}
