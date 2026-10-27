"use client";

import { useQueryState } from "nuqs";

import type { Media, MediaType } from "@tsuki/api/types";

import { useMediaBackgroundSearch } from "@/features/media/hooks/use-media-background-search";

import { DiscoverSearchResults } from "../components/discover-search-results";
import { DiscoverMediaTrending } from "../components/discover-media-trending";

export function DiscoverView({ trending }: { trending: Record<MediaType, Media[]> }) {
  const [query] = useQueryState("q", { defaultValue: "" });
  const backgroundSearch = useMediaBackgroundSearch();
  const searchQuery = (
    backgroundSearch === null ? query : (new URLSearchParams(backgroundSearch).get("q") ?? "")
  ).trim();

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
