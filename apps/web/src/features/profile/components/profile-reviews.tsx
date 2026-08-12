import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";

import type { Review } from "@tsuki/api/types";

import { Spoiler } from "@/shared/components/spoiler";
import {
  getMediaCoverImage,
  getMediaTitle,
  mediaHref,
  mediaImageClass,
} from "@/features/media/media";
import { cn } from "@/shared/lib/utils";

export function ReviewItem({ review }: { review: Review }) {
  const { mediaType, mediaId, media, content, containsSpoilers, createdAt, updatedAt } = review;

  if (!media) return null;

  const cover = getMediaCoverImage(media);
  const title = getMediaTitle(media);
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

        <div className="text-muted-foreground leading-relaxed">
          {containsSpoilers ? (
            <Spoiler>
              <ReviewContent content={content} />
            </Spoiler>
          ) : (
            <ReviewContent content={content} />
          )}
        </div>
      </div>
    </article>
  );
}

function ReviewContent({ content }: { content: string }) {
  return (
    <div className="text-foreground/90 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground [&_code]:rounded-sm [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 last:[&_p]:mb-0 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_ul]:list-disc [&_ul]:pl-6">
      <ReactMarkdown skipHtml disallowedElements={["img"]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
