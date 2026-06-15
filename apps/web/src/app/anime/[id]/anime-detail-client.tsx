"use client";

import Image from "next/image";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { getAnimeTitle, getAnimeCoverImage, getAnimeBannerImage } from "@/lib/anime";
import { animeDetailOptions } from "@/lib/queries";
import { Badge } from "@/components/ui/badge";

export function AnimeDetailClient({ id }: { id: number }) {
  const { data: anime } = useSuspenseQuery(animeDetailOptions(id));

  if (!anime) return null;

  const title = getAnimeTitle(anime);
  const coverImage = getAnimeCoverImage(anime);
  const bannerImage = getAnimeBannerImage(anime);

  return (
    <div className="flex min-h-screen flex-col bg-background pb-16">
      {/* Banner Section */}
      <div className="relative h-[250px] w-full overflow-hidden md:h-[350px]">
        {bannerImage && (
          <>
            <Image
              src={bannerImage}
              alt={`${title} banner`}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            {/* Soft Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          </>
        )}
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header & Poster */}
        <div className="relative -mt-20 flex flex-col gap-6 md:-mt-32 md:flex-row md:items-end md:gap-8 pb-8 border-b">
          <div className="w-40 shrink-0 overflow-hidden rounded-xl ring-1 ring-border shadow-xl md:w-56 z-10 bg-muted">
            <div className="aspect-[3/4] relative">
              {coverImage ? (
                <Image
                  src={coverImage}
                  alt={title}
                  fill
                  sizes="(max-width: 768px) 160px, 224px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-sm">
                  No Image
                </div>
              )}
            </div>
          </div>

          <div className="z-10 flex w-full flex-col gap-3 pb-2 md:pb-4">
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl text-foreground">
              {title}
            </h1>
            {anime.titleNative && anime.titleNative !== title && (
              <p className="text-muted-foreground font-medium">{anime.titleNative}</p>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-2">
              {anime.averageScore && (
                <Badge variant="secondary" className="flex items-center gap-1.5 font-medium">
                  <Star className="h-3.5 w-3.5 fill-current text-yellow-500" />
                  {anime.averageScore}%
                </Badge>
              )}
              {anime.format && <Badge variant="secondary">{anime.format}</Badge>}
              {anime.status && (
                <Badge variant="outline" className="text-muted-foreground">
                  {anime.status}
                </Badge>
              )}
              {anime.season && anime.seasonYear && (
                <Badge variant="outline" className="text-muted-foreground">
                  {`${anime.season} ${anime.seasonYear}`}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="mt-8 grid grid-cols-1 gap-12 md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr]">
          {/* Sidebar */}
          <div className="space-y-8">
            {anime.genres && anime.genres.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
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
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Details
              </h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-1 text-sm">
                <InfoItem label="Episodes" value={anime.episodes} />
                <InfoItem
                  label="Duration"
                  value={anime.duration ? `${anime.duration} mins` : null}
                />
                <InfoItem label="Popularity" value={anime.popularity?.toLocaleString()} />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="min-w-0 space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Synopsis</h2>
            <div
              className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: anime.description || "No synopsis available.",
              }}
            />
          </div>
        </div>
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
