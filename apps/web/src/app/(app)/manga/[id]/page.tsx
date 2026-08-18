import { MediaDetailsView, getMediaMetadata } from "@/features/media/views/media-details-view";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return getMediaMetadata("MANGA", id);
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MediaDetailsView mediaType="MANGA" id={id} />;
}
