"use client";

import { useQueryState } from "nuqs";

import type { MediaCompact, MediaType } from "@tsuki/api/types";

import { DiscoverSearchResults } from "../components/discover-search-results";
import { DiscoverMediaTrending } from "../components/discover-media-trending";

export function DiscoverView({ trending }: { trending: Record<MediaType, MediaCompact[]> }) {
  const [query] = useQueryState("q", { defaultValue: "" });
  const searchQuery = query.trim();

  return (
    <div className="container mx-auto flex flex-col gap-12 px-4 pb-12 pt-24 md:gap-16 md:pb-24 md:pt-32">
      {searchQuery ? (
        <DiscoverSearchResults query={searchQuery} />
      ) : (
        <DiscoverMediaTrending trending={trending} />
      )}
    </div>
  );
}

// TODO: in discover make media type and nsfw a global state to avoid prop drilling.
