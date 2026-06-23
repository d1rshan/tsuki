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
};

const HEADING_CLASS = "text-3xl font-black uppercase tracking-tight md:text-5xl";

const NAV_BUTTON_CLASS =
  "pointer-events-none hidden size-10 border-border bg-background/55 text-foreground opacity-0 hover:size-14 backdrop-blur-2xl transition-all active:!translate-y-0 disabled:hidden hover:!bg-foreground hover:!text-background group-hover/carousel:pointer-events-auto group-hover/carousel:opacity-100 group-focus-within/carousel:pointer-events-auto group-focus-within/carousel:opacity-100 md:inline-flex md:size-12";

export function TopTenCarousel({ animes }: TopTenCarouselProps) {
  if (animes.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4 md:gap-5 w-full">
      <h2 className={HEADING_CLASS}>Top 10 Today</h2>

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
                "basis-[calc(75%+16px)] sm:basis-[calc(55%+16px)] md:basis-[calc(40%+16px)] lg:basis-[calc(32%+16px)] xl:basis-[calc(26%+16px)]";
            } else if (isRank10) {
              basisClass =
                "basis-[calc(75%+24px)] sm:basis-[calc(55%+24px)] md:basis-[calc(40%+32px)] lg:basis-[calc(32%+32px)] xl:basis-[calc(26%+32px)]";
            }

            return (
              <CarouselItem
                key={anime.id}
                className={cn(
                  isRank1 ? "pl-8 md:pl-10" : isRank10 ? "pl-10 md:pl-14" : "pl-4 md:pl-6",
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
                      width: 0,
                      height: "1em",
                      fontSize: "clamp(5.5rem, 11vw, 8.5rem)",
                    }}
                  >
                    <svg className="pointer-events-none select-none overflow-visible absolute inset-0 w-full h-full">
                      <text
                        x="0"
                        y="100%"
                        textAnchor="end"
                        fill="var(--background)"
                        stroke="var(--muted-foreground)"
                        strokeWidth="4px"
                        strokeLinejoin="round"
                        paintOrder="stroke fill"
                        className="font-black tracking-[-0.08em]"
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
          className={cn("absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2", NAV_BUTTON_CLASS)}
        />
        <CarouselNext
          className={cn("absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2", NAV_BUTTON_CLASS)}
        />
      </Carousel>
    </section>
  );
}
