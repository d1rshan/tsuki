"use client";

import { Search } from "lucide-react";
import { type ReactNode } from "react";
import { useQueryState } from "nuqs";

import { Input } from "@/components/ui/input";
import { EmptyState, ErrorState } from "@/components/states";
import { Loader } from "@/components/loader";
import { useAnimeSearch } from "@/hooks/use-anime-search";

import { AnimeGrid } from "./anime-grid";

const MIN_SEARCH_LENGTH = 3;

export function HomeSearchWrapper({ children }: { children: ReactNode }) {
  const [query, setQuery] = useQueryState("q", { defaultValue: "" });
  const searchQuery = query.trim();

  const isSearching = searchQuery.length > 0;
  const canSearch = searchQuery.length >= MIN_SEARCH_LENGTH;

  return (
    <div className="container mx-auto flex flex-col gap-12 px-4 pb-12 pt-24 md:gap-16 md:pb-24 md:pt-32">
      {isSearching ? <SearchResults searchQuery={searchQuery} canSearch={canSearch} /> : children}
    </div>
  );
}

function SearchResults({ searchQuery, canSearch }: { searchQuery: string; canSearch: boolean }) {
  const {
    data: searchResults,
    isLoading,
    isFetching,
    isError,
    isDebouncing,
  } = useAnimeSearch(searchQuery);

  const animes = searchResults ?? [];

  if (!canSearch || isDebouncing || isLoading || isFetching) {
    return <Loader variant="inline" className="h-64" />;
  }

  if (isError) {
    return (
      <ErrorState message="Failed to search anime" description="Please try again in a moment." />
    );
  }

  if (animes.length === 0) {
    return (
      <EmptyState
        title="No results found"
        description={`We couldn't find anything for "${searchQuery}".`}
      />
    );
  }

  return <AnimeGrid animes={animes} />;
}
