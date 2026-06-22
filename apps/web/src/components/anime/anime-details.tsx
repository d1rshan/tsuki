import { Suspense } from "react";
import { ExternalLink } from "lucide-react";

import type { Anime } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { AnimeActions } from "@/components/anime/anime-actions";
import { AnimeActionsSkeleton } from "@/components/anime/anime-skeletons";
import { AnimeTrailer } from "@/components/anime/anime-trailer";

export function AnimeDetails({ anime }: { anime: Anime }) {
  const streamingLinks = anime.externalLinks?.filter((link) => link.type === "STREAMING");

  return (
    <div className="mt-8 grid grid-cols-1 gap-12 md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr]">
      {/* Sidebar */}
      <div className="space-y-8">
        {anime.genres && anime.genres.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Genres
            </h3>
            <div className="flex flex-wrap gap-2">
              {anime.genres.map((genre) => (
                <Badge key={genre} variant="secondary" className="font-normal">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Details
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-1">
            <InfoItem label="Episodes" value={anime.episodes} />
            <InfoItem label="Duration" value={anime.duration ? `${anime.duration} mins` : null} />
            <InfoItem label="Popularity" value={anime.popularity?.toLocaleString()} />
          </div>
        </div>

        {streamingLinks && streamingLinks.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Where to Watch
            </h3>
            <div className="flex flex-col gap-2">
              {streamingLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.icon && (
                    <img
                      src={link.icon}
                      alt={link.site}
                      className="size-4 rounded-sm object-contain"
                    />
                  )}
                  <span className="group-hover:underline group-hover:decoration-dashed group-hover:underline-offset-4">
                    {link.site}
                  </span>
                  <ExternalLink className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
              ))}
            </div>
          </div>
        )}
        <div className="pt-4 border-t">
          <Suspense fallback={<AnimeActionsSkeleton />}>
            <AnimeActions animeId={anime.id} />
          </Suspense>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-w-0 space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Synopsis</h2>
        <div
          className="prose prose-sm max-w-none leading-relaxed text-muted-foreground dark:prose-invert md:prose-base"
          dangerouslySetInnerHTML={{
            __html: anime.description || "No synopsis available.",
          }}
        />

        {anime.trailer && anime.trailer.site === "youtube" && (
          <AnimeTrailer trailerId={anime.trailer.id} />
        )}
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
