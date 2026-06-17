import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";

import { api } from "@/lib/api";
import { Loader } from "@/components/loader";
import { SearchableAnimeGrid } from "@/components/home/searchable-anime-grid";

export default function HomePage() {
  return (
    <main>
      <Suspense fallback={<Loader className="mt-24" />}>
        <TrendingSection />
      </Suspense>
    </main>
  );
}

async function TrendingSection() {
  "use cache: remote";
  cacheLife("days");
  cacheTag("trending-anime");

  const { data: trendingAnime, error } = await api.anime.trending.get();

  return <SearchableAnimeGrid initialAnimes={error ? null : (trendingAnime ?? [])} />;
}
