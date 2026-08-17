import { MediaDetailsView, getMediaMetadata } from "@/features/media/views/media-details-view";

export function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return getMediaMetadata("ANIME", params);
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <MediaDetailsView mediaType="ANIME" params={params} />;
}
