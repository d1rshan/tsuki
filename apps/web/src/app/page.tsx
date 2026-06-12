import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { trendingAnimeOptions } from "@/lib/queries";
import { HomeClient } from "./home-client";

function TrendingSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 animate-pulse">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="aspect-[3/4] rounded-lg bg-muted" />
      ))}
    </div>
  );
}

export default async function Home() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trendingAnimeOptions);

  return (
    <div className="container mx-auto px-4 pt-24">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Trending Now</h1>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<TrendingSkeleton />}>
          <HomeClient />
        </Suspense>
      </HydrationBoundary>
    </div>
  );
}
