"use client";

import Link from "next/link";

import type { ReviewFeedItem } from "@tsuki/api/types";

import { reviewHref } from "@/features/media/media";
import { RichContentView } from "@/features/rich-content/components/rich-content-view";
import { ContentState } from "@/shared/components/content-state";
import { LoadMoreButton } from "@/shared/components/load-more-button";
import { QueryState } from "@/shared/components/query-state";
import { RelativeTime } from "@/shared/components/relative-time";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";

import type { SocialFeedType } from "../data";
import { useSocialReviews } from "../hooks/use-social-reviews";

function ReviewCard({ review }: { review: ReviewFeedItem }) {
  const { author } = review;
  const destination = reviewHref(author.username, review.mediaType, review.mediaId);

  return (
    <article className="min-w-0 rounded-xl bg-muted p-4">
      <div className="flex min-w-0 gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex min-w-0 items-baseline justify-between gap-3">
            <Link
              href={`/${author.username}`}
              className="flex min-w-0 items-center gap-2 text-sm font-medium text-foreground"
            >
              <Avatar className="size-6 shrink-0">
                {author.image ? <AvatarImage src={author.image} alt="" /> : null}
                <AvatarFallback className="bg-card text-xs">
                  {author.displayUsername[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{author.displayUsername}</span>
            </Link>
            <Link
              href={destination}
              className="shrink-0 text-xs text-muted-foreground hover:text-primary"
            >
              <RelativeTime date={review.createdAt} />
            </Link>
          </div>
          <p className="text-sm leading-snug text-muted-foreground">
            Reviewed{" "}
            <Link href={destination} className="font-medium text-inherit hover:text-primary">
              {review.media?.titleRomaji ?? review.media?.titleEnglish ?? "Unknown Title"}
            </Link>
          </p>
          <RichContentView
            content={review.content}
            className="mt-2 text-sm leading-relaxed text-muted-foreground"
          />
        </div>
      </div>
    </article>
  );
}

export function SocialReviews({ type }: { type: SocialFeedType }) {
  const query = useSocialReviews(type);
  const reviews = query.data?.pages.flatMap((page) => page.reviews) ?? [];

  return (
    <QueryState
      isLoading={query.isLoading}
      isError={query.isError}
      isEmpty={!reviews.length}
      errorTitle="Could not load reviews"
      onRetry={() => void query.refetch()}
      empty={
        <ContentState
          title={type === "following" ? "No reviews from people you follow yet" : "No reviews yet"}
        />
      }
    >
      <div className="grid grid-cols-1 gap-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
        <LoadMoreButton
          fetching={query.isFetchingNextPage}
          hasNext={Boolean(query.hasNextPage)}
          onLoadMore={() => void query.fetchNextPage()}
        />
      </div>
    </QueryState>
  );
}
