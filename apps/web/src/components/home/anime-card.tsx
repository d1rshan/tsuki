import Image from "next/image";
import Link from "next/link";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { type Anime } from "@/types/anime";

type AnimeCardProps = {
  anime: Anime;
};

export function AnimeCard({ anime }: AnimeCardProps) {
  const title = anime.titleEnglish || anime.titleRomaji || anime.titleNative || "Unknown Title";
  const coverImage = anime.coverImageExtraLarge || anime.coverImageLarge || "";

  return (
    <Link href={`/anime/${anime.id}`} className="block group">
      <div className="relative overflow-hidden rounded-xl bg-muted border-border">
        <AspectRatio ratio={3 / 4}>
          {coverImage ? (
            <Image
              src={coverImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">No Image</div>
          )}
        </AspectRatio>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
      </div>
    </Link>
  );
}
