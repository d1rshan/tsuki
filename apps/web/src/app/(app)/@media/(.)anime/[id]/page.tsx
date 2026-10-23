import { Suspense } from "react";

import { MediaModal } from "@/features/media/components/media-modal";
import { MediaPageSkeleton } from "@/features/media/components/media-skeletons";
import { MediaView } from "@/features/media/views/media-view";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <MediaModal id={Number(id)} mediaType="ANIME">
      <Suspense fallback={<MediaPageSkeleton />}>
        <main className="container mx-auto max-w-5xl px-4">
          <MediaView mediaType="ANIME" id={id} />
        </main>
      </Suspense>
    </MediaModal>
  );
}
