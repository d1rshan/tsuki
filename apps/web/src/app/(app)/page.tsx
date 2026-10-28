import { Suspense } from "react";
import type { Metadata } from "next";

import { DiscoverSkeleton } from "@/features/discover/components/discover-skeleton";
import { getDiscoverTrendingDetails } from "@/features/discover/data";
import { DiscoverView } from "@/features/discover/views/discover-view";
import { ContentState } from "@/shared/components/content-state";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Page() {
  return (
    <Suspense fallback={<DiscoverSkeleton />}>
      <DiscoverContent />
    </Suspense>
  );
}

async function DiscoverContent() {
  const trending = await getDiscoverTrendingDetails();

  if (!trending) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-24">
        <ContentState
          error
          title="Failed to load discover"
          description="Please try again in a moment."
        />
      </div>
    );
  }

  return <DiscoverView trending={trending} />;
}
