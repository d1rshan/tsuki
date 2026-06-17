import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";

import { Loader } from "@/components/loader";
import { HomeFeed } from "@/components/home/home-feed";
import { api } from "@/lib/api";

export default function HomePage() {
  return (
    <Suspense fallback={<Loader className="mt-24" />}>
      <HomeView />
    </Suspense>
  );
}

async function HomeView() {
  const trendingAnime = await getTrendingAnime();

  return <HomeFeed initialAnimes={trendingAnime} />;
}

async function getTrendingAnime() {
  "use cache: remote";
  cacheLife("days");
  cacheTag("trending-anime");

  const { data, error } = await api.anime.trending.get();

  if (error) {
    return null;
  }

  return data ?? [];
}
