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
    <div className="container mx-auto flex flex-col gap-12 px-4 py-12 md:gap-16 md:py-24">
      <SearchInput query={query} setQuery={setQuery} />

      {isSearching ? <SearchResults searchQuery={searchQuery} canSearch={canSearch} /> : children}
    </div>
  );
}

function SearchInput({ query, setQuery }: { query: string; setQuery: (query: string) => void }) {
  return (
    <header className="flex justify-end">
      <div className="relative w-full sm:w-80">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search anime..."
          className="bg-muted/50 pl-9 transition-colors focus:bg-background"
        />
      </div>
    </header>
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
