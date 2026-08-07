import { Suspense } from "react";
import { connection } from "next/server";

import { LoadingIndicator } from "@/shared/components/loading-indicator";

import { getTrending } from "../../media/data";
import { DiscoverView } from "../components/discover-view";

export function DiscoverPage() {
  return (
    <Suspense fallback={<LoadingIndicator className="min-h-screen" label="Loading discover" />}>
      <DiscoverContent />
    </Suspense>
  );
}

async function DiscoverContent() {
  await connection();

  const [anime, manga] = await Promise.all([getTrending("ANIME"), getTrending("MANGA")]);
  return <DiscoverView trending={{ ANIME: anime, MANGA: manga }} />;
}
