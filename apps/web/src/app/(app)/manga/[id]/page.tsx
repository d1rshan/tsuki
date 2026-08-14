import { MediaDetailsPage, getMediaMetadata } from "@/features/media/pages/media-details-page";

export function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return getMediaMetadata("MANGA", params);
}

export default function MangaPage({ params }: { params: Promise<{ id: string }> }) {
  return <MediaDetailsPage mediaType="MANGA" params={params} />;
}
