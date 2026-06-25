import { cacheLife } from "next/cache";
import { ErrorState } from "@/components/states";
import { AnimeGrid } from "@/components/home/anime-grid";
import { HomeSearchWrapper } from "@/components/home/home-search-wrapper";
import { TopTenCarousel } from "@/components/home/top-ten-carousel";

import { api } from "@/lib/api";

const TOP_TEN_LIMIT = 10;
const FEATURED_HEADING_CLASS = "text-3xl font-black uppercase tracking-tight md:text-5xl";

export default async function HomePage() {
  "use cache: remote";
  cacheLife("days");

  return (
    <HomeSearchWrapper>
      <HomeServer />
    </HomeSearchWrapper>
  );
}

async function HomeServer() {
  const { data: trendingAnime, error } = await api.anime.trending.get();

  if (error) {
    return <ErrorState message="Failed to load anime" description="Please try again later." />;
  }

  const topTenAnimes = trendingAnime.slice(0, TOP_TEN_LIMIT);
  const moreTrendingAnimes = trendingAnime.slice(TOP_TEN_LIMIT);

  return (
    <>
      <TopTenCarousel animes={topTenAnimes} />

      <section className="flex flex-col gap-4">
        <h2 className={FEATURED_HEADING_CLASS}>More Trending</h2>
        <AnimeGrid animes={moreTrendingAnimes} />
      </section>
    </>
  );
}
