import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { getMangaTitle, getMangaCoverImage } from "@/lib/manga";
import { cn } from "@/lib/utils";
import { type MangaCompact } from "@/lib/types";

export function MangaCard({ manga, className }: { manga: MangaCompact; className?: string }) {
  const href = `/manga/${manga.id}`;
  const title = getMangaTitle(manga);
  const coverImage = getMangaCoverImage(manga);

  const metadata = [manga.seasonYear, manga.chapters ? `${manga.chapters} ch` : null]
    .filter(Boolean)
    .join(" • ");

  return (
    <Link
      href={href}
      className={cn(
        "group relative block overflow-hidden rounded-xl bg-muted ring-1 ring-border/50 transition-all duration-300 hover:ring-border",
        className,
      )}
      prefetch={false}
    >
      <AspectRatio ratio={3 / 4}>
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
            No Image
          </div>
        )}
      </AspectRatio>

      {manga.averageScore && (
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-background/60 px-1.5 py-0.5 text-xs font-medium text-foreground backdrop-blur-md transition-opacity group-hover:opacity-100">
          <Star className="size-3 fill-primary text-primary" />
          <span className="tracking-tight">{manga.averageScore}%</span>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 pt-16">
        <h3 className="line-clamp-1 text-sm font-bold text-white transition-colors">{title}</h3>
        {metadata && (
          <p className="line-clamp-1 mt-0.5 text-xs font-medium text-white/80">{metadata}</p>
        )}
      </div>
    </Link>
  );
}
