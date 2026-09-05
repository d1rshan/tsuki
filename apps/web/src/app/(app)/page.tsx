import type { Metadata } from "next";

import { getDiscoverMediaTrending } from "@/features/discover/data";
import { DiscoverView } from "@/features/discover/views/discover-view";
import { ContentState } from "@/shared/components/content-state";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Page() {
  const trending = await getDiscoverMediaTrending();

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
