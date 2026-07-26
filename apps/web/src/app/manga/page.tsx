import { cacheLife } from "next/cache";
import { ErrorState } from "@/components/states";
import { MangaGrid } from "@/components/home/manga-grid";
import { MangaSearchWrapper } from "@/components/home/manga-search-wrapper";
import { TopMangaCarousel } from "@/components/home/top-manga-carousel";

import { api } from "@/lib/api";

const TOP_TEN_LIMIT = 10;
const FEATURED_HEADING_CLASS = "text-3xl font-black uppercase tracking-tight md:text-5xl";

export default async function MangaPage() {
  "use cache: remote";
  cacheLife("days");

  return (
    <MangaSearchWrapper>
      <MangaServer />
    </MangaSearchWrapper>
  );
}

async function MangaServer() {
  const { data: trendingManga, error } = await api.manga.trending.get();

  if (error) {
    return <ErrorState message="Failed to load manga" description="Please try again later." />;
  }

  const topTenMangas = trendingManga.slice(0, TOP_TEN_LIMIT);
  const moreTrendingMangas = trendingManga.slice(TOP_TEN_LIMIT);

  return (
    <>
      <TopMangaCarousel mangas={topTenMangas} />

      <section className="flex flex-col gap-4">
        <h2 className={FEATURED_HEADING_CLASS}>More Trending</h2>
        <MangaGrid mangas={moreTrendingMangas} />
      </section>
    </>
  );
}
