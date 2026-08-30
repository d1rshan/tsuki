import { Suspense } from "react";

import { MediaJsonLd } from "@/features/media/components/media-json-ld";
import { MediaPageSkeleton } from "@/features/media/components/media-skeletons";
import { getMediaMetadata } from "@/features/media/data";
import { MediaView } from "@/features/media/views/media-view";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return getMediaMetadata("MANGA", id);
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<MediaPageSkeleton />}>
      <MediaJsonLd mediaType="MANGA" id={id} />
      <MediaView mediaType="MANGA" id={id} />
    </Suspense>
  );
}
