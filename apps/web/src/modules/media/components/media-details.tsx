import { Suspense } from "react";
import { ExternalLink } from "lucide-react";

import type { Media } from "@tsuki/api/types";

import { Badge } from "@/components/ui/badge";

import { MediaActions } from "./media-actions";
import { MediaActionsSkeleton } from "./media-skeletons";
import { MediaTrailer } from "./media-trailer";

export function MediaDetails({ media }: { media: Media }) {
  const isAnime = media.type === "anime";

  // Anime links are dominated by streaming services, so we surface only those.
  // Manga has no streaming link type, so all links are shown.
  const links = isAnime
    ? media.externalLinks?.filter((link) => link.type === "STREAMING")
    : media.externalLinks;
  const linksHeading = isAnime ? "Where to Watch" : "More Info";

  return (
    <div className="mt-8 grid grid-cols-1 gap-12 md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr]">
      {/* Sidebar */}
      <div className="space-y-8">
        {media.genres && media.genres.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Genres
            </h3>
            <div className="flex flex-wrap gap-2">
              {media.genres.map((genre) => (
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
            {isAnime ? (
              <>
                <InfoItem label="Episodes" value={media.episodes} />
                <InfoItem
                  label="Duration"
                  value={media.duration ? `${media.duration} mins` : null}
                />
              </>
            ) : (
              <>
                <InfoItem label="Chapters" value={media.chapters} />
                <InfoItem label="Volumes" value={media.volumes} />
              </>
            )}
            <InfoItem label="Popularity" value={media.popularity?.toLocaleString()} />
          </div>
        </div>

        {links && links.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {linksHeading}
            </h3>
            <div className="flex flex-col gap-2">
              {links.map((link) => (
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
                      className="size-4 rounded-sm bg-primary p-0.5 dark:bg-transparent dark:p-0 object-contain"
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
          <Suspense fallback={<MediaActionsSkeleton />}>
            <MediaActions mediaType={media.type} mediaId={media.id} total={media.unitCount} />
          </Suspense>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-w-0 space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Synopsis</h2>
        <div
          className="prose prose-sm max-w-none leading-relaxed text-muted-foreground dark:prose-invert md:prose-base"
          dangerouslySetInnerHTML={{
            __html: media.description || "No synopsis available.",
          }}
        />

        {media.trailer && media.trailer.site === "youtube" && (
          <MediaTrailer trailerId={media.trailer.id} />
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
