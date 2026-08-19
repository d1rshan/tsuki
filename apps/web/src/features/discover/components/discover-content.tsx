"use client";

import { Eye, EyeOff } from "lucide-react";
import { useLayoutEffect } from "react";
import { useQueryState, parseAsBoolean, parseAsStringEnum } from "nuqs";

import type { MediaCompact, MediaType } from "@tsuki/api/types";

import { Button } from "@/shared/components/ui/button";
import { MediaGrid } from "@/features/media/components/media-grid";
import { MediaTypeToggle } from "@/features/media/components/media-type-toggle";
import { TopTenCarousel } from "@/features/discover/components/top-ten-carousel";
import { useMediaSearch } from "@/features/media/hooks/use-media-search";
import { MEDIA_TYPES } from "@/features/media/media";
import { cn } from "@/shared/lib/utils";
import { EmptyState, ErrorState } from "@/shared/components/content-state";
import { Loader } from "@/shared/components/loader";

const TOP_TEN_LIMIT = 10;
const FEATURED_HEADING_CLASS = "text-3xl font-black uppercase md:text-5xl";
const MEDIA_TYPE_STORAGE_KEY = "discover-media-type";

export function DiscoverContent({ trending }: { trending: Record<MediaType, MediaCompact[]> }) {
  const [query] = useQueryState("q", { defaultValue: "" });
  const [includeNsfw, setIncludeNsfw] = useQueryState("nsfw", parseAsBoolean.withDefault(false));
  const [typeParam, setTypeParam] = useQueryState(
    "type",
    parseAsStringEnum<MediaType>([...MEDIA_TYPES]),
  );
  const type = typeParam ?? "ANIME";

  useLayoutEffect(() => {
    if (typeParam) {
      window.localStorage.setItem(MEDIA_TYPE_STORAGE_KEY, typeParam);
      return;
    }

    if (window.localStorage.getItem(MEDIA_TYPE_STORAGE_KEY) === "MANGA") {
      void setTypeParam("MANGA");
    }
  }, [setTypeParam, typeParam]);

  const setType = (value: MediaType) => {
    window.localStorage.setItem(MEDIA_TYPE_STORAGE_KEY, value);
    void setTypeParam(value);
  };
  const searchQuery = query.trim();

  const items = trending[type];

  return (
    <div className="container mx-auto flex flex-col gap-12 px-4 pb-12 pt-24 md:gap-16 md:pb-24 md:pt-32">
      {searchQuery.length > 0 ? (
        <SearchResults
          type={type}
          onTypeChange={setType}
          searchQuery={searchQuery}
          includeNsfw={includeNsfw}
          onNsfwChange={setIncludeNsfw}
        />
      ) : (
        <>
          <TopTenCarousel
            items={items.slice(0, TOP_TEN_LIMIT)}
            mediaType={type}
            actions={<MediaTypeToggle compact value={type} onChange={setType} />}
          />
          <section className="flex flex-col gap-4">
            <h2 className={FEATURED_HEADING_CLASS}>More Trending</h2>
            <MediaGrid items={items.slice(TOP_TEN_LIMIT)} mediaType={type} />
          </section>
        </>
      )}
    </div>
  );
}

function SearchResults({
  type,
  onTypeChange,
  searchQuery,
  includeNsfw,
  onNsfwChange,
}: {
  type: MediaType;
  onTypeChange: (value: MediaType) => void;
  searchQuery: string;
  includeNsfw: boolean;
  onNsfwChange: (value: boolean) => void;
}) {
  const { data, isLoading, isFetching, isError, isDebouncing } = useMediaSearch(
    type,
    searchQuery,
    includeNsfw,
  );

  const results = data ?? [];
  const isPending = isFetching || isDebouncing;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold tracking-tight">
          Search results for &ldquo;{searchQuery}&rdquo;
        </h2>
        <div className="flex items-center gap-2">
          <MediaTypeToggle compact value={type} onChange={onTypeChange} />
          <Button
            type="button"
            variant={includeNsfw ? "default" : "outline"}
            onClick={() => onNsfwChange(!includeNsfw)}
            aria-pressed={includeNsfw}
            aria-label={includeNsfw ? "Hide mature results" : "Show mature results"}
            className="rounded-lg sm:h-9 sm:rounded-xl sm:px-3 sm:text-sm"
          >
            {includeNsfw ? <Eye data-icon="inline-start" /> : <EyeOff data-icon="inline-start" />}
            <span>NSFW</span>
          </Button>
        </div>
      </div>

      {isLoading || (results.length === 0 && isPending) ? (
        <Loader />
      ) : isError ? (
        <ErrorState
          title={`Failed to search ${type.toLowerCase()}`}
          description="Please try again in a moment."
        />
      ) : results.length === 0 && !isPending ? (
        <EmptyState
          title="No results found"
          description={`We couldn't find anything for "${searchQuery}".`}
        />
      ) : (
        <div className="relative">
          <div
            className={cn(
              "transition-all duration-300 ease-out",
              isPending
                ? "blur-[2px] opacity-60 scale-[0.98] pointer-events-none"
                : "blur-0 opacity-100 scale-100",
            )}
          >
            <MediaGrid items={results} mediaType={type} />
          </div>
          {isPending && (
            <div className="absolute inset-0 z-10 flex items-start justify-center pt-32 pointer-events-none">
              <div className="rounded-full bg-background/50 p-4 backdrop-blur-md">
                <Loader className="min-h-0" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
