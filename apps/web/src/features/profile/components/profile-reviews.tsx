import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import type { Review } from "@tsuki/api/types";

import { mediaHref, mediaImageClass, normalizeMediaCompact } from "@/features/media/media";
import { Spoiler } from "@/shared/components/spoiler";
import { cn } from "@/shared/lib/utils";

export function ReviewItem({ review }: { review: Review }) {
  const { mediaType, mediaId, media, content, containsSpoilers, createdAt, updatedAt } = review;

  if (!media) return null;

  const { coverImage: cover, title } = normalizeMediaCompact(media);
  const href = mediaHref(mediaType, mediaId);

  return (
    <article className="group py-8 first:pt-0 border-b border-border/40 last:border-0 flex gap-6 md:gap-8">
      <Link
        href={href}
        className="relative hidden aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-xl bg-muted shadow-sm transition-transform duration-500 group-hover:scale-105 group-hover:shadow-md group-hover:ring-1 group-hover:ring-primary/50 sm:block md:w-28"
      >
        {cover ? (
          <Image
            src={cover}
            alt={title}
            fill
            className={cn("object-cover", mediaImageClass(mediaType))}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50 p-2 text-center text-xs text-muted-foreground" />
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <div className="mb-5">
          <Link href={href} className="inline-block">
            <h3 className="text-lg font-bold tracking-tight transition-colors hover:text-primary md:text-xl">
              {title}
            </h3>
          </Link>
          <div className="text-sm text-muted-foreground mt-1.5 flex items-center gap-2 font-medium">
            <span>
              Reviewed{" "}
              {formatDistanceToNow(new Date(updatedAt || createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>

        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
          {containsSpoilers ? (
            <Spoiler>{content}</Spoiler>
          ) : (
            <p className="whitespace-pre-wrap text-foreground/90">{content}</p>
          )}
        </div>
      </div>
    </article>
  );
}
