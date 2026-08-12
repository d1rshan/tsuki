import { cacheLife } from "next/cache";
import { Suspense } from "react";

import { ErrorState } from "@/shared/components/content-state";

import { getTrending } from "../../media/data";
import { ContinueMedia } from "../components/continue-media";
import { DiscoverView } from "../components/discover-view";

export function DiscoverPage() {
  return (
    <div className="container mx-auto flex flex-col gap-12 px-4 pb-12 pt-24 md:gap-16 md:pb-24 md:pt-32">
      <Suspense fallback={null}>
        <ContinueMedia />
      </Suspense>
      <Suspense>
        <TrendingDiscover />
      </Suspense>
    </div>
  );
}

async function TrendingDiscover() {
  "use cache: remote";
  cacheLife("days");

  try {
    const [anime, manga] = await Promise.all([getTrending("ANIME"), getTrending("MANGA")]);

    return (
      <Suspense>
        <DiscoverView trending={{ ANIME: anime, MANGA: manga }} />
      </Suspense>
    );
  } catch {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <ErrorState title="Failed to load discover" description="Please try again in a moment." />
      </div>
    );
  }
}
