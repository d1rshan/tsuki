"use client";

import { Search } from "lucide-react";
import { useQueryState } from "nuqs";

import { Loader } from "@/components/loader";
import { Input } from "@/components/ui/input";
import { useAnimeSearch } from "@/hooks/use-anime-search";
import { type AnimeCompact } from "@/types/anime";

import { AnimeCard } from "./anime-card";
import { TopTenCarousel } from "./top-ten-carousel";

type HomeFeedProps = {
  initialAnimes: AnimeCompact[] | null;
};

const MIN_SEARCH_LENGTH = 3;
const TOP_TEN_LIMIT = 10;
const FEATURED_HEADING_CLASS = "text-3xl font-black uppercase tracking-tight md:text-5xl";

export function HomeFeed({ initialAnimes }: HomeFeedProps) {
  const [query, setQuery] = useQueryState("q", { defaultValue: "" });
  const searchQuery = query.trim();

  const {
    data: searchResults,
    isLoading,
    isFetching,
    isError,
    isDebouncing,
  } = useAnimeSearch(searchQuery);

  const isSearching = searchQuery.length > 0;
  const canSearch = searchQuery.length >= MIN_SEARCH_LENGTH;

  const trendingAnimes = initialAnimes ?? [];
  const topTenAnimes = trendingAnimes.slice(0, TOP_TEN_LIMIT);
  const moreTrendingAnimes = trendingAnimes.slice(TOP_TEN_LIMIT);

  function renderSearchContent() {
    const animes = searchResults ?? [];

    // if (!canSearch) {
    //   return (
    //     <EmptyState
    //       title={`Type at least ${MIN_SEARCH_LENGTH} characters`}
    //       description="We'll start searching once your query is longer."
    //     />
    //   );
    // }

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

  function renderBrowseContent() {
    if (initialAnimes === null) {
      return <ErrorState message="Failed to load anime" description="Please try again later." />;
    }

    return (
      <div className="flex flex-col gap-14 md:gap-16">
        <TopTenCarousel animes={topTenAnimes} />

        <section className="flex flex-col gap-4">
          <h2 className={FEATURED_HEADING_CLASS}>More Trending</h2>

          {moreTrendingAnimes.length > 0 ? (
            <AnimeGrid animes={moreTrendingAnimes} />
          ) : (
            <EmptyState title="No additional trending anime right now" />
          )}
        </section>
      </div>
    );
  }

  function renderContent() {
    return isSearching ? renderSearchContent() : renderBrowseContent();
  }

  return (
    <section className="container mx-auto flex flex-col gap-8 px-4 py-12 md:gap-10 md:py-24">
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

      {renderContent()}
    </section>
  );
}

function AnimeGrid({ animes }: { animes: AnimeCompact[] }) {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {animes.map((anime, index) => (
        <AnimeCard key={anime.id} anime={anime} priority={index < 6} />
      ))}
    </div>
  );
}

function ErrorState({ message, description }: { message: string; description: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-1 text-destructive">
      <p className="font-medium">{message}</p>
      <p className="text-sm opacity-80">{description}</p>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground">
      <Search className="size-8 opacity-40" />
      <p className="font-medium">{title}</p>
      {description ? <p className="text-sm">{description}</p> : null}
    </div>
  );
}
