"use client";

import Link from "next/link";
import { useQueryState } from "nuqs";

import type { Media, MediaType } from "@tsuki/api/types";
import { useSession } from "@tsuki/auth/client";

import { useMediaBackgroundSearch } from "@/features/media/hooks/use-media-background-search";
import { Button } from "@/shared/components/ui/button";

import { DiscoverSearchResults } from "../components/discover-search-results";
import { DiscoverCurrentMedia } from "../components/discover-current-media";
import { DiscoverMediaTrending } from "../components/discover-media-trending";

export function DiscoverView({ trending }: { trending: Record<MediaType, Media[]> }) {
  const [query] = useQueryState("q", { defaultValue: "" });
  const { data: session } = useSession();
  const backgroundSearch = useMediaBackgroundSearch();
  const searchQuery = (
    backgroundSearch === null ? query : (new URLSearchParams(backgroundSearch).get("q") ?? "")
  ).trim();

  return (
    <div className="flex flex-col gap-12 pb-24 pt-32 md:gap-16 md:pb-24">
      {searchQuery ? (
        <DiscoverSearchResults query={searchQuery} />
      ) : (
        <>
          {!session?.user && (
            <div className="flex gap-2">
              <Button variant="outline" render={<Link href="/login" />} nativeButton={false}>
                Sign in
              </Button>
              <Button render={<Link href="/login?mode=signup" />} nativeButton={false}>
                Create account
              </Button>
            </div>
          )}
          <DiscoverCurrentMedia />
          <DiscoverMediaTrending trending={trending} />
        </>
      )}
    </div>
  );
}
