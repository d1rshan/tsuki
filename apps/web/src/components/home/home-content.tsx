"use client";

import { useQueryState } from "nuqs";
import { Search as SearchIcon } from "lucide-react";

import { useAnimeSearch } from "@/hooks/use-anime-search";
import { Loader } from "@/components/loader";
import { Input } from "@/components/ui/input";

import { AnimeCard } from "./anime-card";

export function HomeContent({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useQueryState("q", { defaultValue: "" });

  const { data: results, isLoading, isError } = useAnimeSearch(query);

  const hasSearch = query.length >= 3;

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold tracking-tight uppercase">
          {hasSearch ? "SEARCH RESULTS" : "TRENDING NOW"}
        </h1>

        <div className="relative w-full sm:w-[280px]">
          <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none z-10">
            <SearchIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            type="text"
            className="pl-9 h-10"
            placeholder="Search for an anime..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {hasSearch ? (
        isLoading ? (
          <Loader variant="inline" className="min-h-[400px]" />
        ) : isError ? (
          <SearchErrorState />
        ) : results?.length === 0 ? (
          <SearchEmptyState query={query} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {results?.map((anime, index) => (
              <AnimeCard key={anime.id} anime={anime} priority={index < 6} />
            ))}
          </div>
        )
      ) : (
        children
      )}
    </>
  );
}

function SearchErrorState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-destructive">
      <p className="text-lg font-medium">Failed to load search results</p>
      <p className="text-sm opacity-80 mt-1">Please try again later</p>
    </div>
  );
}

function SearchEmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground animate-in fade-in zoom-in-95 duration-300">
      <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <SearchIcon className="h-8 w-8 opacity-50" />
      </div>
      <p className="text-lg font-medium text-foreground">No matches found</p>
      <p className="text-sm mt-1">We couldn't find any anime matching &quot;{query}&quot;</p>
    </div>
  );
}
