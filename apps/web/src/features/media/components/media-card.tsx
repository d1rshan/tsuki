import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

import type { MediaCompact } from "@tsuki/api/types";

import { AspectRatio } from "@/shared/components/ui/aspect-ratio";
import { cn } from "@/shared/lib/utils";

import { MEDIA, mediaHref, mediaImageClass, normalizeMediaCompact } from "../media";

export function MediaCard({ media, className }: { media: MediaCompact; className?: string }) {
  const normalizedMedia = normalizeMediaCompact(media);
  const { averageScore, title, coverImage, count, seasonYear, type } = normalizedMedia;
  const metadata = [seasonYear, count ? `${count} ${MEDIA[type].unitShort}` : null]
    .filter(Boolean)
    .join(" • ");

  return (
    <Link
      href={mediaHref(type, normalizedMedia.id)}
      className={cn(
        "group relative block overflow-hidden rounded-xl bg-muted ring-1 ring-border/50 transition-colors hover:ring-border",
        className,
      )}
    >
      <AspectRatio ratio={3 / 4}>
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            fill
            className={cn(
              "object-cover transition-transform group-hover:scale-105",
              mediaImageClass(type),
            )}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
            No Image
          </div>
        )}
      </AspectRatio>

      {averageScore ? (
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-background/60 px-1.5 py-0.5 text-xs font-medium backdrop-blur-md">
          <Star className="size-3 fill-primary text-primary" />
          {averageScore}%
        </div>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 pt-16">
        <h3 className="line-clamp-1 text-sm font-bold text-white">{title}</h3>
        {metadata ? (
          <p className="line-clamp-1 mt-0.5 text-xs font-medium text-white/80">{metadata}</p>
        ) : null}
      </div>
    </Link>
  );
}
