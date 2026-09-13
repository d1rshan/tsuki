import Image from "next/image";
import Link from "next/link";

import type { Review } from "@tsuki/api/types";

import { mediaHref, mediaImageClass, normalizeMediaCompact } from "@/features/media/media";
import { RichContentView } from "@/features/rich-content/components/rich-content-view";
import { RelativeTime } from "@/shared/components/relative-time";
import { cn } from "@/shared/lib/utils";

import { BENTO_CARD } from "./profile-section";

export function ReviewItem({ className, review }: { className?: string; review: Review }) {
  const { mediaType, mediaId, media, content, createdAt, updatedAt } = review;

  if (!media) return null;

  const { coverImage: cover, title } = normalizeMediaCompact(media);
  const href = mediaHref(mediaType, mediaId);

  return (
    <article className={cn(BENTO_CARD, "group flex flex-col p-5 sm:p-6", className)}>
      <div className="flex items-center gap-3">
        <Link
          href={href}
          className="relative aspect-[3/4] w-11 shrink-0 overflow-hidden rounded-lg bg-muted shadow-sm transition-transform duration-500 group-hover:scale-105 group-hover:ring-1 group-hover:ring-primary/50"
        >
          {cover ? (
            <Image
              src={cover}
              alt={title}
              fill
              sizes="44px"
              className={cn("object-cover", mediaImageClass(mediaType))}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50 p-1 text-center text-[10px] text-muted-foreground" />
          )}
        </Link>

        <div className="min-w-0">
          <Link href={href} className="inline-block">
            <h3 className="line-clamp-1 font-bold tracking-tight transition-colors hover:text-primary">
              {title}
            </h3>
          </Link>
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">
            Reviewed <RelativeTime date={updatedAt || createdAt} />
          </p>
        </div>
      </div>

      <RichContentView content={content} className="mt-4 leading-relaxed text-muted-foreground" />
    </article>
  );
}
