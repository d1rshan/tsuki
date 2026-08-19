import { Suspense } from "react";

import { getDiscoverTrending } from "@/features/discover/data";
import { DiscoverView } from "@/features/discover/views/discover-view";
import { ErrorState } from "@/shared/components/content-state";

export default async function Page() {
  const trending = await getDiscoverTrending().catch(() => null);

  if (!trending) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 pt-24">
        <ErrorState title="Failed to load discover" description="Please try again in a moment." />
      </div>
    );
  }

  return (
    <Suspense>
      <DiscoverView trending={trending} />
    </Suspense>
  );
}
