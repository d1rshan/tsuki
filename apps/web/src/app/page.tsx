import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";

import { Loader } from "@/components/loader";
import { HomeFeed } from "@/components/home/home-feed";
import { api } from "@/lib/api";
import { trendingAnime } from "@tsuki/db";

// export default function HomePage() {
//   return (
//     <Suspense fallback={<Loader className="mt-24" />}>
//       <HomeView />
//     </Suspense>
//   );
// }

export const instant = { prefetch: "static" };

export default async function HomeView() {
  "use cache: remote";
  cacheLife("max");
  cacheTag("trending-anime");

  const { data, error } = await api.anime.trending.get();

  let trendingAnime = null;
  if (error) {
    trendingAnime = null;
  }

  trendingAnime = data ?? [];

  return <HomeFeed initialAnimes={trendingAnime} />;
}
