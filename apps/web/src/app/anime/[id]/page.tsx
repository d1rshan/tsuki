import Image from "next/image";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getAnimeTitle, getAnimeBannerImage, getAnimeCoverImage } from "@/lib/anime";
import { api } from "@/lib/api";
import { type Anime } from "@/types/anime";

export default async function AnimePage({ params }: { params: Promise<{ id: string }> }) {
  "use cache: remote";

  const { id } = await params;
  const { data: anime, error } = await api.anime({ id }).get();

  if (error || !anime) {
    return notFound();
  }

  const title = getAnimeTitle(anime);
  const coverImage = getAnimeCoverImage(anime);
  const bannerImage = getAnimeBannerImage(anime);

  return (
    <div className="pb-16">
      <AnimeBanner bannerImage={bannerImage} title={title} />
      <div className="container mx-auto max-w-6xl px-4">
        <AnimeHeader anime={anime} title={title} coverImage={coverImage} />
        <AnimeDetails anime={anime} />
      </div>
    </div>
  );
}

function AnimeBanner({ bannerImage, title }: { bannerImage: string | null; title: string }) {
  if (!bannerImage) {
    return <div className="relative h-[250px] w-full overflow-hidden md:h-[350px]" />;
  }

  return (
    <div className="relative h-[250px] w-full overflow-hidden md:h-[350px]">
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
    </div>
  );
}

function AnimeHeader({
  anime,
  title,
  coverImage,
}: {
  anime: Anime;
  title: string;
  coverImage: string | null;
}) {
  return (
    <div className="relative z-10 -mt-20 flex flex-col gap-6 border-b pb-8 md:-mt-32 md:flex-row md:items-end md:gap-8">
      {/* Poster */}
      <div className="relative aspect-[3/4] w-40 shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border shadow-xl md:w-56">
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
          <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
            No Image
          </div>
        )}
      </div>

      {/* Header Info */}
      <div className="flex flex-1 flex-col gap-2 pb-2 md:pb-4">
        <h1 className="text-3xl font-bold tracking-tight md:text-5xl">{title}</h1>

        {anime.titleNative && anime.titleNative !== title && (
          <p className="font-medium text-muted-foreground">{anime.titleNative}</p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-2">
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
  );
}

function AnimeDetails({ anime }: { anime: Anime }) {
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
