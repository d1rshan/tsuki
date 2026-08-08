import { cacheLife } from "next/cache";
import { Suspense } from "react";

import { ErrorState } from "@/shared/components/content-state";

import { getTrending } from "../../media/data";
import { DiscoverView } from "../components/discover-view";

export async function DiscoverPage() {
  "use cache: remote";
  cacheLife("days");

  try {
    const [anime, manga] = await Promise.all([getTrending("ANIME"), getTrending("MANGA")]);

    return (
      <Suspense>
        <DiscoverView trending={{ ANIME: anime, MANGA: manga }} />;
      </Suspense>
    );
  } catch {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 pt-24">
        <ErrorState title="Failed to load discover" description="Please try again in a moment." />
      </div>
    );
  }
}
