"use client";

import type { MediaCompact, MediaType } from "@tsuki/api/types";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/shared/lib/utils";

import { MediaCard } from "./media-card";

type TopTenCarouselProps = {
  actions?: React.ReactNode;
  items: MediaCompact[];
  mediaType: MediaType;
};

const LIMIT = 10;

const NAV_BUTTON_CLASS =
  "inline-flex size-10 border-border bg-background/55 text-foreground transition-all hover:size-14 hover:!bg-foreground hover:!text-background active:!-translate-y-1/2 backdrop-blur-2xl disabled:pointer-events-auto disabled:opacity-100 md:size-12 lg:pointer-events-none lg:opacity-0 lg:group-hover/carousel:pointer-events-auto lg:group-hover/carousel:opacity-100 lg:group-focus-within/carousel:pointer-events-auto lg:group-focus-within/carousel:opacity-100";

export function TopTenCarousel({ actions, items, mediaType }: TopTenCarouselProps) {
  const topTenItems = items.slice(0, LIMIT);

  return (
    <section className="flex w-full flex-col gap-4 md:gap-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className={"text-3xl font-black tracking-tight uppercase md:text-5xl"}>Top 10 Today</h2>
        {actions}
      </div>

      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="group/carousel w-full"
      >
        <CarouselContent className="-ml-4 py-6 md:-ml-6 md:py-10">
          {topTenItems.map((media, index) => {
            const rank = index + 1;

            return (
              <CarouselItem
                key={media.id}
                className={cn(getRankPaddingClass(rank), getRankBasisClass(rank))}
              >
                <article className="group relative flex h-full items-end justify-end transition-all duration-500 hover:z-50">
                  <div
                    className={cn(
                      "absolute bottom-0 z-10 drop-shadow-md",
                      rank === 1
                        ? "right-[calc(64%-0.25rem)] sm:right-[calc(68%-0.5rem)]"
                        : "right-[calc(64%-0.75rem)] sm:right-[calc(68%-1.25rem)]",
                    )}
                    style={{
                      minWidth: "1px",
                      height: "1em",
                      fontSize: "clamp(5.5rem, 11vw, 8.5rem)",
                    }}
                  >
                    <svg className="pointer-events-none select-none overflow-visible absolute inset-0 w-full h-full">
                      <text
                        x="0"
                        y="100%"
                        textAnchor="end"
                        fill="currentColor"
                        strokeWidth="4px"
                        strokeLinejoin="round"
                        paintOrder="stroke fill"
                        className="text-background stroke-muted-foreground font-black tracking-[-0.08em]"
                      >
                        {rank}
                      </text>
                    </svg>
                  </div>
                  <div className="relative z-20 w-[64%] shrink-0 sm:w-[68%]">
                    <MediaCard media={media} mediaType={mediaType} className="w-full shadow-md" />
                  </div>
                </article>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        <CarouselPrevious
          className={cn(
            "absolute left-2 md:left-0 top-1/2 -translate-y-1/2 disabled:active:-translate-x-2",
            NAV_BUTTON_CLASS,
          )}
        />
        <CarouselNext
          className={cn(
            "absolute right-2 md:right-0 top-1/2 -translate-y-1/2 disabled:active:translate-x-2",
            NAV_BUTTON_CLASS,
          )}
        />
      </Carousel>
    </section>
  );
}

function getRankBasisClass(rank: number) {
  if (rank === 1) {
    return "basis-[calc(75%-16px)] sm:basis-[calc(55%-16px)] md:basis-[calc(40%-24px)] lg:basis-[calc(32%-24px)] xl:basis-[calc(26%-24px)]";
  }

  if (rank === LIMIT) {
    return "basis-[calc(75%+24px)] sm:basis-[calc(55%+24px)] md:basis-[calc(40%+32px)] lg:basis-[calc(32%+32px)] xl:basis-[calc(26%+32px)]";
  }

  return "basis-[75%] sm:basis-[55%] md:basis-[40%] lg:basis-[32%] xl:basis-[26%]";
}

function getRankPaddingClass(rank: number) {
  if (rank === 1) {
    return "pl-0";
  }

  if (rank === LIMIT) {
    return "pl-10 md:pl-14";
  }

  return "pl-4 md:pl-6";
}
