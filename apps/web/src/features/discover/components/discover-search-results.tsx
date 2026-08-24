"use client";

import { Eye, EyeOff, SearchX } from "lucide-react";
import { parseAsBoolean, useQueryState } from "nuqs";

import type { MediaType } from "@tsuki/api/types";

import { MediaGrid } from "@/features/media/components/media-grid";
import { useMediaSearch } from "@/features/media/hooks/use-media-search";
import { useMediaType } from "@/features/media/hooks/use-media-type";
import { MEDIA } from "@/features/media/media";
import { ContentState } from "@/shared/components/content-state";
import { Loader } from "@/shared/components/loader";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

import { DiscoverSection } from "./discover-section";

export function DiscoverSearchResults({ query }: { query: string }) {
  const [includeNsfw, setIncludeNsfw] = useQueryState("nsfw", parseAsBoolean.withDefault(false));
  const [mediaType, setMediaType] = useMediaType();
  const {
    data: items = [],
    isError,
    isLoading,
    isPending,
  } = useMediaSearch(mediaType, query, includeNsfw);
  const isInitialLoad = isLoading || (items.length === 0 && isPending);

  function renderResults() {
    if (isInitialLoad) return <Loader />;

    if (isError) {
      return (
        <ContentState
          error
          title={`Failed to search ${mediaType.toLowerCase()}`}
          description="Please try again in a moment."
        />
      );
    }

    if (items.length === 0) {
      return (
        <ContentState
          icon={SearchX}
          title="No results found"
          description={`We couldn't find anything for "${query}".`}
        />
      );
    }

    return (
      <div className="relative" aria-busy={isPending}>
        <div className={cn("transition-opacity", isPending && "pointer-events-none opacity-50")}>
          <MediaGrid items={items} />
        </div>
        {isPending ? <Loader className="absolute inset-0 min-h-0" /> : null}
      </div>
    );
  }

  return (
    <DiscoverSection
      title={`Results for “${query}”`}
      actions={
        <DiscoverSearchActions
          includeNsfw={includeNsfw}
          mediaType={mediaType}
          onMediaTypeChange={setMediaType}
          onNsfwChange={(value) => void setIncludeNsfw(value)}
        />
      }
    >
      {renderResults()}
    </DiscoverSection>
  );
}

function DiscoverSearchActions({
  includeNsfw,
  mediaType,
  onMediaTypeChange,
  onNsfwChange,
}: {
  includeNsfw: boolean;
  mediaType: MediaType;
  onMediaTypeChange: (value: MediaType) => void;
  onNsfwChange: (value: boolean) => void;
}) {
  const nextMediaType = mediaType === "ANIME" ? "MANGA" : "ANIME";

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        size="lg"
        onClick={() => onMediaTypeChange(nextMediaType)}
        aria-label={`Switch from ${MEDIA[mediaType].label} to ${MEDIA[nextMediaType].label}`}
      >
        {MEDIA[mediaType].label}
      </Button>
      <Button
        type="button"
        size="lg"
        variant={includeNsfw ? "default" : "outline"}
        onClick={() => onNsfwChange(!includeNsfw)}
      >
        {includeNsfw ? <Eye data-icon="inline-start" /> : <EyeOff data-icon="inline-start" />}
        NSFW
      </Button>
    </div>
  );
}
