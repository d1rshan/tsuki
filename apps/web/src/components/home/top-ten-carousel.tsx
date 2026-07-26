"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { type AnimeCompact } from "@/lib/types";
import { cn } from "@/lib/utils";

import { AnimeCard } from "./anime-card";

type TopTenCarouselProps = {
  animes: AnimeCompact[];
  actions?: React.ReactNode;
};

const HEADING_CLASS = "text-3xl font-black uppercase tracking-tight md:text-5xl";

const NAV_BUTTON_CLASS =
  "inline-flex size-10 border-border bg-background/55 text-foreground transition-all hover:size-14 hover:!bg-foreground hover:!text-background active:!-translate-y-1/2 disabled:opacity-100 disabled:pointer-events-auto  backdrop-blur-2xl md:size-12 lg:pointer-events-none lg:opacity-0 lg:group-hover/carousel:pointer-events-auto lg:group-hover/carousel:opacity-100 lg:group-focus-within/carousel:pointer-events-auto lg:group-focus-within/carousel:opacity-100";

export function TopTenCarousel({ animes, actions }: TopTenCarouselProps) {
  return (
    <section className="flex flex-col gap-4 md:gap-5 w-full">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className={HEADING_CLASS}>Top 10 Today</h2>
        {actions}
      </div>

      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="group/carousel w-full"
      >
        <CarouselContent className="-ml-4 md:-ml-6 py-6 md:py-10">
          {animes.slice(0, 10).map((anime, index) => {
            const rank = index + 1;
            const isRank10 = rank === 10;
            const isRank1 = rank === 1;

            let basisClass =
              "basis-[75%] sm:basis-[55%] md:basis-[40%] lg:basis-[32%] xl:basis-[26%]";
            if (isRank1) {
              basisClass =
                "basis-[calc(75%-16px)] sm:basis-[calc(55%-16px)] md:basis-[calc(40%-24px)] lg:basis-[calc(32%-24px)] xl:basis-[calc(26%-24px)]";
            } else if (isRank10) {
              basisClass =
                "basis-[calc(75%+24px)] sm:basis-[calc(55%+24px)] md:basis-[calc(40%+32px)] lg:basis-[calc(32%+32px)] xl:basis-[calc(26%+32px)]";
            }

            return (
              <CarouselItem
                key={anime.id}
                className={cn(
                  isRank1 ? "pl-0" : isRank10 ? "pl-10 md:pl-14" : "pl-4 md:pl-6",
                  basisClass,
                )}
              >
                <article className="group relative flex h-full items-end justify-end transition-all duration-500 hover:z-50">
                  {/* The Huge Number */}
                  <div
                    className={cn(
                      "absolute bottom-0 z-10 drop-shadow-md",
                      isRank1
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

                  {/* The Card */}
                  <div className="relative z-20 w-[64%] sm:w-[68%] shrink-0">
                    <AnimeCard anime={anime} className="w-full shadow-md" />
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
