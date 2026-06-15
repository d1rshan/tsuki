import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { animeDetailOptions } from "@/lib/queries";
import { AnimeDetailClient } from "./anime-detail-client";
import { notFound } from "next/navigation";

export default async function AnimeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (isNaN(id)) return notFound();

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(animeDetailOptions(id));
  const anime = queryClient.getQueryData(animeDetailOptions(id).queryKey);

  if (!anime) {
    return notFound();
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<AnimeDetailSkeleton />}>
        <AnimeDetailClient id={id} />
      </Suspense>
    </HydrationBoundary>
  );
}

function AnimeDetailSkeleton() {
  return (
    <div className="w-full animate-pulse">
      <div className="h-[300px] w-full bg-muted/50 md:h-[400px]" />
      <div className="container mx-auto px-4">
        <div className="relative -mt-24 flex flex-col gap-8 md:-mt-32 md:flex-row md:items-end md:gap-12 pb-8">
          <div className="w-48 shrink-0 space-y-4 md:w-64">
            <div className="aspect-[3/4] w-full rounded-xl bg-muted" />
          </div>
          <div className="space-y-4 pb-4 w-full">
            <div className="h-10 w-2/3 rounded bg-muted" />
            <div className="h-6 w-1/3 rounded bg-muted" />
            <div className="flex gap-2">
              <div className="h-6 w-16 rounded-full bg-muted" />
              <div className="h-6 w-16 rounded-full bg-muted" />
              <div className="h-6 w-16 rounded-full bg-muted" />
            </div>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[250px_1fr] lg:grid-cols-[300px_1fr]">
          <div className="space-y-6">
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="h-4 w-1/2 rounded bg-muted mb-2" />
                  <div className="h-4 w-3/4 rounded bg-muted" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-4 w-5/6 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
