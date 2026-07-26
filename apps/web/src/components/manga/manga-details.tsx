import { Suspense } from "react";
import { ExternalLink } from "lucide-react";

import type { Manga } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { MangaActions } from "@/components/manga/manga-actions";
import { MangaActionsSkeleton } from "@/components/manga/manga-skeletons";
import { MangaTrailer } from "@/components/manga/manga-trailer";

export function MangaDetails({ manga }: { manga: Manga }) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-12 md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr]">
      {/* Sidebar */}
      <div className="space-y-8">
        {manga.genres && manga.genres.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Genres
            </h3>
            <div className="flex flex-wrap gap-2">
              {manga.genres.map((genre) => (
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
            <InfoItem label="Chapters" value={manga.chapters} />
            <InfoItem label="Volumes" value={manga.volumes} />
            <InfoItem label="Popularity" value={manga.popularity?.toLocaleString()} />
          </div>
        </div>

        {manga.externalLinks && manga.externalLinks.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              More Info
            </h3>
            <div className="flex flex-col gap-2">
              {manga.externalLinks.map((link) => (
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
          <Suspense fallback={<MangaActionsSkeleton />}>
            <MangaActions mangaId={manga.id} totalChapters={manga.chapters} />
          </Suspense>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-w-0 space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Synopsis</h2>
        <div
          className="prose prose-sm max-w-none leading-relaxed text-muted-foreground dark:prose-invert md:prose-base"
          dangerouslySetInnerHTML={{
            __html: manga.description || "No synopsis available.",
          }}
        />

        {manga.trailer && manga.trailer.site === "youtube" && (
          <MangaTrailer trailerId={manga.trailer.id} />
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
