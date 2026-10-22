"use client";

import { useQueryState } from "nuqs";

import type { MediaCompact, MediaType } from "@tsuki/api/types";

import { DiscoverSearchResults } from "../components/discover-search-results";
import { DiscoverMediaTrending } from "../components/discover-media-trending";

export function DiscoverView({ trending }: { trending: Record<MediaType, MediaCompact[]> }) {
  const [query] = useQueryState("q", { defaultValue: "" });
  const searchQuery = query.trim();

  return (
    <div className="flex flex-col gap-12 pb-24 pt-32 md:gap-16 md:pb-24">
      {searchQuery ? (
        <DiscoverSearchResults query={searchQuery} />
      ) : (
        <DiscoverMediaTrending trending={trending} />
      )}
    </div>
  );
}
