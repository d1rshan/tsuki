"use client";

import { useQueryState } from "nuqs";
import { Search } from "lucide-react";

import { useAnimeSearch } from "@/hooks/use-anime-search";
import { Loader } from "@/components/loader";
import { Input } from "@/components/ui/input";
import { AnimeCard } from "./anime-card";
import { type AnimeCompact } from "@/types/anime";

type SearchableAnimeGridProps = {
  initialAnimes: AnimeCompact[] | null;
};

export function SearchableAnimeGrid({ initialAnimes }: SearchableAnimeGridProps) {
  const [query, setQuery] = useQueryState("q", { defaultValue: "" });
  const { data: searchResults, isLoading, isError: searchError } = useAnimeSearch(query);

  const hasSearch = query.length >= 3;

  // Unified state resolution
  const displayAnimes = hasSearch ? searchResults : initialAnimes;
  const isFetching = hasSearch ? isLoading : false;
  const hasError = hasSearch ? searchError : initialAnimes === null;

  return (
    <div className="container mx-auto px-4 py-12 md:py-24 space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">
          {hasSearch ? "Search Results" : "Trending Now"}
        </h1>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anime..."
            className="pl-9 bg-muted/50 transition-colors focus:bg-background"
          />
        </div>
      </header>

      <main className="min-h-[400px]">
        {isFetching ? (
          <Loader variant="inline" className="h-64" />
        ) : hasError ? (
          <div className="flex h-64 flex-col items-center justify-center text-destructive">
            <p className="font-medium">Failed to load anime</p>
            <p className="text-sm opacity-80">Please try again later</p>
          </div>
        ) : displayAnimes?.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
            <Search className="mb-3 h-8 w-8 opacity-40" />
            <p className="font-medium">No results found</p>
            <p className="text-sm">We couldn&apos;t find anything for &quot;{query}&quot;</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {displayAnimes?.map((anime, i) => (
              <AnimeCard key={anime.id} anime={anime} priority={!hasSearch && i < 6} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
