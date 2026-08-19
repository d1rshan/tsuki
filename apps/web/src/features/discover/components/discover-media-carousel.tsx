"use client";

import type { MediaCompact, MediaType } from "@tsuki/api/types";

import { MediaCard } from "@/features/media/components/media-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/components/ui/carousel";
import { cn } from "@/shared/lib/utils";

type DiscoverMediaCarouselProps = {
  items: MediaCompact[];
  mediaType: MediaType;
};

export function DiscoverMediaCarousel({ items, mediaType }: DiscoverMediaCarouselProps) {
  return (
    <Carousel opts={{ align: "start", dragFree: true }}>
      <CarouselContent className="ml-0 py-6 md:py-10">
        {items.map((media, index) => (
          <CarouselItem
            key={media.id}
            className="basis-3/4 pl-4 first:pl-0 sm:basis-1/2 md:basis-2/5 lg:basis-1/3 xl:basis-1/4"
          >
            <article className="relative flex h-full items-end">
              <span
                aria-hidden="true"
                className={cn(
                  "absolute bottom-0 z-10 text-[clamp(5.5rem,11vw,8.5rem)] font-black leading-none tracking-[-0.08em] text-background drop-shadow-md",
                  index === 0
                    ? "right-[calc(64%-0.25rem)] sm:right-[calc(68%-0.5rem)]"
                    : "right-[calc(64%-0.75rem)] sm:right-[calc(68%-1.25rem)]",
                )}
                style={{
                  WebkitTextStroke: "4px var(--muted-foreground)",
                  paintOrder: "stroke fill",
                }}
              >
                {index + 1}
              </span>
              <MediaCard
                media={media}
                mediaType={mediaType}
                className="relative z-20 ml-auto w-[64%] shadow-md sm:w-[68%]"
              />
            </article>
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
