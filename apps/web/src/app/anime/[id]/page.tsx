import { Suspense } from "react";
import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";

import { getAnimeTitle, getAnimeBannerImage, getAnimeCoverImage } from "@/lib/anime";
import { api } from "@/lib/api";
import { AnimeBanner } from "@/components/anime/anime-banner";
import { AnimeHeader } from "@/components/anime/anime-header";
import { AnimeDetails } from "@/components/anime/anime-details";
import { AnimePageSkeleton } from "@/components/anime/anime-skeletons";

// TODO: we hv to do smth for this too!, same with profile queries.ts

async function getCachedAnime(id: string) {
  "use cache: remote";
  cacheLife("max");
  const { data, error } = await api.anime({ id }).get();

  if (error) {
    return { data: null, error: { status: error.status, message: error.value } };
  }

  return { data, error: null };
}

export default function AnimePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<AnimePageSkeleton />}>
      <AnimePageContent params={params} />
    </Suspense>
  );
}

async function AnimePageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: anime, error } = await getCachedAnime(id);

  if (error) return notFound();

  const title = getAnimeTitle(anime);
  const coverImage = getAnimeCoverImage(anime);
  const bannerImage = getAnimeBannerImage(anime);

  return (
    <div className="pb-16">
      <AnimeBanner bannerImage={bannerImage} title={title} />
      <div className="container mx-auto max-w-6xl px-4">
        <AnimeHeader anime={anime} title={title} coverImage={coverImage} />
        <AnimeDetails anime={anime} />
      </div>
    </div>
  );
}
