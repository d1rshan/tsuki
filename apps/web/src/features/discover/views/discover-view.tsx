"use client";

import { parseAsBoolean, useQueryState } from "nuqs";

import type { MediaCompact, MediaType } from "@tsuki/api/types";

import { useMediaType } from "@/features/media/hooks/use-media-type";

import { DiscoverSearchResults } from "../components/discover-search-results";
import { DiscoverTrending } from "../components/discover-trending";

type DiscoverViewProps = {
  trending: Record<MediaType, MediaCompact[]>;
};

export function DiscoverView({ trending }: DiscoverViewProps) {
  const [query] = useQueryState("q", { defaultValue: "" });
  const [includeNsfw, setIncludeNsfw] = useQueryState("nsfw", parseAsBoolean.withDefault(false));
  const [mediaType, setMediaType] = useMediaType();
  const searchQuery = query.trim();

  return (
    <div className="container mx-auto flex flex-col gap-12 px-4 pb-12 pt-24 md:gap-16 md:pb-24 md:pt-32">
      {searchQuery ? (
        <DiscoverSearchResults
          query={searchQuery}
          mediaType={mediaType}
          includeNsfw={includeNsfw}
          onMediaTypeChange={setMediaType}
          onNsfwChange={(value) => void setIncludeNsfw(value)}
        />
      ) : (
        <DiscoverTrending
          items={trending[mediaType]}
          mediaType={mediaType}
          onMediaTypeChange={setMediaType}
        />
      )}
    </div>
  );
}
