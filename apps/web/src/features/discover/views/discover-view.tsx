"use client";

import { useQueryState } from "nuqs";

import type { MediaCompact, MediaType } from "@tsuki/api/types";

import { DiscoverHero } from "../components/discover-hero";
import { DiscoverSearchResults } from "../components/discover-search-results";
import { DiscoverMediaTrending } from "../components/discover-media-trending";

export function DiscoverView({ trending }: { trending: Record<MediaType, MediaCompact[]> }) {
  const [query] = useQueryState("q", { defaultValue: "" });
  const searchQuery = query.trim();

  return (
    <div className="flex flex-col gap-12 pb-12 pt-24 md:gap-16 md:pb-24 md:pt-32">
      <DiscoverHero />
      {searchQuery ? (
        <DiscoverSearchResults query={searchQuery} />
      ) : (
        <DiscoverMediaTrending trending={trending} />
      )}
    </div>
  );
}
