import { Suspense } from "react";
import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";

import { getMediaTitle, getMediaBannerImage, getMediaCoverImage } from "@/lib/media";
import { api } from "@/lib/api";
import { MediaBanner } from "@/components/media/media-banner";
import { MediaHeader } from "@/components/media/media-header";
import { MediaDetails } from "@/components/media/media-details";
import { MediaPageSkeleton } from "@/components/media/media-skeletons";

async function getCachedManga(id: string) {
  "use cache: remote";
  cacheLife("max");
  const { data, error } = await api.manga({ id }).get();

  if (error) {
    return { data: null, error: { status: error.status, message: error.value } };
  }

  return { data, error: null };
}

export default function MangaPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<MediaPageSkeleton />}>
      <MangaPageContent params={params} />
    </Suspense>
  );
}

async function MangaPageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: manga, error } = await getCachedManga(id);

  if (error) return notFound();

  const title = getMediaTitle(manga);
  const coverImage = getMediaCoverImage(manga);
  const bannerImage = getMediaBannerImage(manga);

  return (
    <div className="pb-16">
      <MediaBanner bannerImage={bannerImage} title={title} />
      <div className="container mx-auto max-w-6xl px-4">
        <MediaHeader media={manga} title={title} coverImage={coverImage} />
        <MediaDetails media={manga} mediaType="manga" />
      </div>
    </div>
  );
}
