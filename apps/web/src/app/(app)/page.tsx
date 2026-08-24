import { Suspense } from "react";

import { io } from "next/cache";

import { getDiscoverMediaTrending } from "@/features/discover/data";
import { DiscoverView } from "@/features/discover/views/discover-view";
import { ContentState } from "@/shared/components/content-state";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <DiscoverContent />
    </Suspense>
  );
}

async function DiscoverContent() {
  await io();
  const trending = await getDiscoverMediaTrending().catch(() => null);

  if (!trending) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 pt-24">
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
