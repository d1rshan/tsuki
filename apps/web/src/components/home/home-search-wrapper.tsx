"use client";

import { type ReactNode } from "react";
import { useQueryState, parseAsBoolean } from "nuqs";

import { cn } from "@/lib/utils";
import { EmptyState, ErrorState } from "@/components/states";
import { Loader } from "@/components/loader";
import { useAnimeSearch } from "@/hooks/use-anime-search";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { AnimeGrid } from "./anime-grid";

export function HomeSearchWrapper({ children }: { children: ReactNode }) {
  const [query] = useQueryState("q", { defaultValue: "" });
  const [includeNsfw, setIncludeNsfw] = useQueryState("nsfw", parseAsBoolean.withDefault(false));
  const searchQuery = query.trim();

  return (
    <div className="container mx-auto flex flex-col gap-12 px-4 pb-12 pt-24 md:gap-16 md:pb-24 md:pt-32">
      {searchQuery.length > 0 ? (
        <SearchResults
          searchQuery={searchQuery}
          includeNsfw={includeNsfw}
          onNsfwChange={setIncludeNsfw}
        />
      ) : (
        children
      )}
    </div>
  );
}

function SearchResults({
  searchQuery,
  includeNsfw,
  onNsfwChange,
}: {
  searchQuery: string;
  includeNsfw: boolean;
  onNsfwChange: (value: boolean) => void;
}) {
  const {
    data: searchResults,
    isLoading,
    isFetching,
    isError,
    isDebouncing,
  } = useAnimeSearch(searchQuery, includeNsfw);

  const animes = searchResults ?? [];
  const isPending = isFetching || isDebouncing;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">
          Search Results for "{searchQuery}"
        </h2>
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

      {isLoading || (animes.length === 0 && isPending) ? (
        <Loader variant="inline" className="h-64" />
      ) : isError ? (
        <ErrorState message="Failed to search anime" description="Please try again in a moment." />
      ) : animes.length === 0 && !isPending ? (
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
            <AnimeGrid animes={animes} />
          </div>
          {isPending && (
            <div className="absolute inset-0 z-10 flex items-start justify-center pt-32 pointer-events-none">
              <div className="rounded-full bg-background/50 p-4 backdrop-blur-md">
                <Loader variant="inline" className="h-auto w-auto" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
