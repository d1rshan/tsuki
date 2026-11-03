import { Suspense } from "react";
import type { Metadata } from "next";
import { io } from "next/cache";

import { DiscoverSection } from "@/features/discover/components/discover-section";
import { getDiscoverTrendingDetails } from "@/features/discover/data";
import { DiscoverView } from "@/features/discover/views/discover-view";
import { MediaGrid } from "@/features/media/components/media-grid";
import { Skeleton } from "@/shared/components/ui/skeleton";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div
          className="flex flex-col gap-12 pb-24 pt-32 md:gap-16 md:pb-24"
          role="status"
          aria-label="Loading trending titles"
        >
          <DiscoverSection>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-5">
              {Array.from({ length: 10 }, (_, index) => (
                <Skeleton key={index} className="aspect-[3/4] rounded-xl" />
              ))}
            </div>
          </DiscoverSection>
        </div>
      }
    >
      <DiscoverContent />
    </Suspense>
  );
}

async function DiscoverContent() {
  // Keep API-backed cached content out of the build-time static shell.
  await io();
  const trending = await getDiscoverTrendingDetails();

  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-12 pb-24 pt-32 md:gap-16 md:pb-24">
          <DiscoverSection>
            <MediaGrid items={trending.ANIME} />
          </DiscoverSection>
        </div>
      }
    >
      <DiscoverView trending={trending} />
    </Suspense>
  );
}
