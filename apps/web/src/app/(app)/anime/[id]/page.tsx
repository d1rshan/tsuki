import { MediaDetailsView, getMediaMetadata } from "@/features/media/views/media-details-view";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return getMediaMetadata("ANIME", id);
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MediaDetailsView mediaType="ANIME" id={id} />;
}
