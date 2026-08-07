"use client";

import { useQueryState, parseAsBoolean, parseAsStringEnum } from "nuqs";

import type { MediaCompact, MediaType } from "@tsuki/api/types";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MediaGrid } from "@/features/media/components/media-grid";
import { MediaTypeToggle } from "@/features/media/components/media-type-toggle";
import { TopTenCarousel } from "@/features/media/components/top-ten-carousel";
import { useMediaSearch } from "@/features/media/hooks/use-media-search";
import { MEDIA_TYPES } from "@/features/media/media";
import { cn } from "@/lib/utils";
import { EmptyState, ErrorState } from "@/shared/components/content-state";
import { LoadingIndicator } from "@/shared/components/loading-indicator";

const TOP_TEN_LIMIT = 10;
const FEATURED_HEADING_CLASS = "text-3xl font-black uppercase md:text-5xl";

export function DiscoverView({ trending }: { trending: Record<MediaType, MediaCompact[]> }) {
  const [query] = useQueryState("q", { defaultValue: "" });
  const [includeNsfw, setIncludeNsfw] = useQueryState("nsfw", parseAsBoolean.withDefault(false));
  const [type, setType] = useQueryState(
    "type",
    parseAsStringEnum<MediaType>([...MEDIA_TYPES]).withDefault("ANIME"),
  );
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
            actions={<MediaTypeToggle value={type} onChange={setType} />}
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Search results for &ldquo;{searchQuery}&rdquo;
        </h2>
        <div className="flex items-center gap-4">
          <MediaTypeToggle value={type} onChange={onTypeChange} />
          <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border">
            <Switch
              id="nsfw-mode"
              checked={includeNsfw}
              onCheckedChange={onNsfwChange}
              className="data-[state=checked]:bg-red-500"
            />
            <Label htmlFor="nsfw-mode" className="text-sm font-medium cursor-pointer">
              Show NSFW
            </Label>
          </div>
        </div>
      </div>

      {isLoading || (results.length === 0 && isPending) ? (
        <LoadingIndicator />
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
                <LoadingIndicator className="min-h-0" label="Updating results" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
