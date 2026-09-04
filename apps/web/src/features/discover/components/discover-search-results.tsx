"use client";

import { SearchX } from "lucide-react";
import { parseAsBoolean, useQueryState } from "nuqs";

import { MediaGrid } from "@/features/media/components/media-grid";
import { useMediaSearch } from "@/features/media/hooks/use-media-search";
import { useMediaType } from "@/features/media/hooks/use-media-type";
import { ContentState } from "@/shared/components/content-state";
import { cn } from "@/shared/lib/utils";

import { DiscoverSection } from "./discover-section";

export function DiscoverSearchResults({ query }: { query: string }) {
  const [includeNsfw] = useQueryState("nsfw", parseAsBoolean.withDefault(false));
  const [mediaType] = useMediaType();
  const { data: items = [], isError, isPending } = useMediaSearch(mediaType, query, includeNsfw);

  function renderResults() {
    if (isError)
      return (
        <ContentState
          error
          title={`Failed to search ${mediaType.toLowerCase()}`}
          description="Please try again in a moment."
        />
      );

    if (items.length > 0)
      return (
        <div
          className={cn(isPending && "pointer-events-none opacity-70 blur-[2px]")}
          aria-busy={isPending}
        >
          <MediaGrid items={items} />
        </div>
      );

    if (!isPending)
      return (
        <ContentState
          icon={SearchX}
          title="No results found"
          description={`We couldn't find anything for "${query}".`}
        />
      );

    return null;
  }

  return <DiscoverSection>{renderResults()}</DiscoverSection>;
}
