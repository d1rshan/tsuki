import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import type { Review } from "@tsuki/api/types";

import { mediaHref, mediaImageClass, normalizeMediaCompact } from "@/features/media/media";
import { RichContentView } from "@/features/rich-content/components/rich-content-view";
import { cn } from "@/shared/lib/utils";

export function ReviewItem({ review }: { review: Review }) {
  const { mediaType, mediaId, media, content, createdAt, updatedAt } = review;

  if (!media) return null;

  const { coverImage: cover, title } = normalizeMediaCompact(media);
  const href = mediaHref(mediaType, mediaId);

  return (
    <article className="group border-b border-border/40 py-8 first:pt-0 last:border-0">
      <div className="flex items-start gap-3">
        <Link
          href={href}
          className="relative aspect-[3/4] w-12 shrink-0 overflow-hidden rounded-lg bg-muted shadow-sm transition-transform duration-500 group-hover:scale-105 group-hover:shadow-md group-hover:ring-1 group-hover:ring-primary/50"
        >
          {cover ? (
            <Image
              src={cover}
              alt={title}
              fill
              className={cn("object-cover", mediaImageClass(mediaType))}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50 p-1 text-center text-[10px] text-muted-foreground" />
          )}
        </Link>

        <div className="min-w-0 pt-0.5">
          <Link href={href} className="inline-block">
            <h3 className="text-lg font-bold tracking-tight transition-colors hover:text-primary md:text-xl">
              {title}
            </h3>
          </Link>
          <div className="mt-1.5 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span>
              Reviewed{" "}
              {formatDistanceToNow(new Date(updatedAt || createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
      </div>

      <RichContentView
        content={content}
        className="mt-5 max-w-none text-muted-foreground leading-relaxed"
      />
    </article>
  );
}
