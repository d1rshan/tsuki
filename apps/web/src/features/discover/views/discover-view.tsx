import { cacheLife } from "next/cache";
import { Suspense } from "react";

import { ErrorState } from "@/shared/components/content-state";

import { getTrending } from "../../media/data";
import { DiscoverContent } from "../components/discover-content";

export async function DiscoverView() {
  "use cache: remote";
  cacheLife("days");

  const trending = await Promise.all([getTrending("ANIME"), getTrending("MANGA")]).catch(
    () => null,
  );

  if (!trending) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 pt-24">
        <ErrorState title="Failed to load discover" description="Please try again in a moment." />
      </div>
    );
  }

  const [anime, manga] = trending;

  return (
    <Suspense>
      <DiscoverContent trending={{ ANIME: anime, MANGA: manga }} />
    </Suspense>
  );
}
