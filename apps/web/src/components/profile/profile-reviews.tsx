import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import { getAnimeCoverImage, getAnimeTitle } from "@/lib/anime";
import { SpoilerBlock } from "@/components/spoiler-block";
import type { Review } from "@/lib/types";

export function ReviewItem({ review }: { review: Review }) {
  if (!review.anime) return null;

  const cover = getAnimeCoverImage(review.anime);
  const title = getAnimeTitle(review.anime);

  return (
    <article className="group py-8 first:pt-0 border-b border-border/40 last:border-0 flex gap-6 md:gap-8">
      <Link
        href={`/anime/${review.animeId}`}
        className="shrink-0 relative w-20 md:w-28 aspect-[3/4] rounded-xl overflow-hidden bg-muted hidden sm:block shadow-sm transition-transform duration-500 group-hover:scale-105 group-hover:shadow-md group-hover:ring-1 group-hover:ring-primary/50"
      >
        {cover ? (
          <Image src={cover} alt={title} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50 text-xs text-muted-foreground p-2 text-center" />
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <div className="mb-5">
          <Link href={`/anime/${review.animeId}`} className="inline-block">
            <h3 className="text-lg md:text-xl font-bold tracking-tight hover:text-primary transition-colors">
              {title}
            </h3>
          </Link>
          <div className="text-sm text-muted-foreground mt-1.5 flex items-center gap-2 font-medium">
            <span>
              Reviewed{" "}
              {formatDistanceToNow(new Date(review.updatedAt || review.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>

        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
          {review.containsSpoilers ? (
            <SpoilerBlock content={review.content} />
          ) : (
            <p className="whitespace-pre-wrap text-foreground/90">{review.content}</p>
          )}
        </div>
      </div>
    </article>
  );
}
