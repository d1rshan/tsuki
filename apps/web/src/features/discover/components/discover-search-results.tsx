"use client";

import { RotateCw, SearchX, TriangleAlert } from "lucide-react";
import { parseAsBoolean, useQueryState } from "nuqs";

import { MediaGrid } from "@/features/media/components/media-grid";
import { useMediaSearch } from "@/features/media/hooks/use-media-search";
import { useMediaType } from "@/features/media/hooks/use-media-type";
import { ContentState } from "@/shared/components/content-state";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

import { DiscoverSection } from "./discover-section";

export function DiscoverSearchResults({ query }: { query: string }) {
  const [includeNsfw] = useQueryState("nsfw", parseAsBoolean.withDefault(false));
  const [mediaType] = useMediaType();
  const {
    data: items = [],
    isError,
    isPending,
    refetch,
  } = useMediaSearch(mediaType, query, includeNsfw);

  function renderResults() {
    if (isError)
      return (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>Failed to search {mediaType.toLowerCase()}</AlertTitle>
          <AlertDescription>Please try again in a moment.</AlertDescription>
          <AlertAction>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              <RotateCw />
              Retry
            </Button>
          </AlertAction>
        </Alert>
      );

    if (items.length > 0)
      return (
        <div
          className={cn(isPending && "pointer-events-none opacity-70 blur-[2px]")}
          aria-busy={isPending}
        >
          <MediaGrid items={items} />
        </div>
      );

    if (!isPending)
      return (
        <ContentState
          icon={SearchX}
          title="No results found"
          description={`We couldn't find anything for "${query}".`}
        />
      );

    return null;
  }

  return <DiscoverSection>{renderResults()}</DiscoverSection>;
}
