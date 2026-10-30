import { Suspense } from "react";
import type { Metadata } from "next";

import { DiscoverSection } from "@/features/discover/components/discover-section";
import { getDiscoverTrendingDetails } from "@/features/discover/data";
import { DiscoverView } from "@/features/discover/views/discover-view";
import { MediaGrid } from "@/features/media/components/media-grid";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Page() {
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
