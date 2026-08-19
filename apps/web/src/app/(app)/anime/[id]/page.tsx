import { Suspense } from "react";

import { MediaPageSkeleton } from "@/features/media/components/media-skeletons";
import { getMediaMetadata } from "@/features/media/data";
import { MediaView } from "@/features/media/views/media-view";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return getMediaMetadata("ANIME", id);
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<MediaPageSkeleton />}>
      <MediaView mediaType="ANIME" id={id} />
    </Suspense>
  );
}
