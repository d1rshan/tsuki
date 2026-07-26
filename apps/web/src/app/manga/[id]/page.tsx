import { Suspense } from "react";
import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";

import { getMangaTitle, getMangaBannerImage, getMangaCoverImage } from "@/lib/manga";
import { api } from "@/lib/api";
import { MangaBanner } from "@/components/manga/manga-banner";
import { MangaHeader } from "@/components/manga/manga-header";
import { MangaDetails } from "@/components/manga/manga-details";
import { MangaPageSkeleton } from "@/components/manga/manga-skeletons";

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
    <Suspense fallback={<MangaPageSkeleton />}>
      <MangaPageContent params={params} />
    </Suspense>
  );
}

async function MangaPageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: manga, error } = await getCachedManga(id);

  if (error) return notFound();

  const title = getMangaTitle(manga);
  const coverImage = getMangaCoverImage(manga);
  const bannerImage = getMangaBannerImage(manga);

  return (
    <div className="pb-16">
      <MangaBanner bannerImage={bannerImage} title={title} />
      <div className="container mx-auto max-w-6xl px-4">
        <MangaHeader manga={manga} title={title} coverImage={coverImage} />
        <MangaDetails manga={manga} />
      </div>
    </div>
  );
}
