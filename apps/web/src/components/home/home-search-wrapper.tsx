"use client";

import { type ReactNode } from "react";
import { useQueryState } from "nuqs";

import { cn } from "@/lib/utils";
import { EmptyState, ErrorState } from "@/components/states";
import { Loader } from "@/components/loader";
import { useAnimeSearch } from "@/hooks/use-anime-search";

import { AnimeGrid } from "./anime-grid";

export function HomeSearchWrapper({ children }: { children: ReactNode }) {
  const [query] = useQueryState("q", { defaultValue: "" });
  const searchQuery = query.trim();

  const isSearching = searchQuery.length > 0;

  return (
    <div className="container mx-auto flex flex-col gap-12 px-4 pb-12 pt-24 md:gap-16 md:pb-24 md:pt-32">
      {isSearching ? <SearchResults searchQuery={searchQuery} /> : children}
    </div>
  );
}

function SearchResults({ searchQuery }: { searchQuery: string }) {
  const {
    data: searchResults,
    isLoading,
    isFetching,
    isError,
    isDebouncing,
  } = useAnimeSearch(searchQuery);

  const animes = searchResults ?? [];
  const isPending = isFetching || isDebouncing;

  if (isLoading) {
    return <Loader variant="inline" className="h-64" />;
  }

  if (isError) {
    return (
      <ErrorState message="Failed to search anime" description="Please try again in a moment." />
    );
  }

  if (animes.length === 0 && !isPending) {
    return (
      <EmptyState
        title="No results found"
        description={`We couldn't find anything for "${searchQuery}".`}
      />
    );
  }

  if (animes.length === 0 && isPending) {
    return <Loader variant="inline" className="h-64" />;
  }

  return (
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
  );
}
