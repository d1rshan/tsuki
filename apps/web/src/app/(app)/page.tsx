import { Suspense } from "react";

import { io } from "next/cache";

import { getDiscoverMediaTrending } from "@/features/discover/data";
import { DiscoverView } from "@/features/discover/views/discover-view";
import { ErrorState } from "@/shared/components/content-state";

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
      <div className="flex min-h-screen items-center justify-center pt-24">
        <ErrorState title="Failed to load discover" description="Please try again in a moment." />
      </div>
    );
  }

  return <DiscoverView trending={trending} />;
}
