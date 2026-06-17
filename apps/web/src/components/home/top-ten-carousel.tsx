"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { type AnimeCompact } from "@/types/anime";
import { AnimeCard } from "./anime-card";

type TopTenCarouselProps = {
  animes: AnimeCompact[];
};

const HEADING_CLASS = "text-3xl font-black uppercase tracking-tight md:text-5xl";
const NAV_BUTTON_CLASS =
  "pointer-events-none hidden size-10 border-white/10 bg-background/55 text-foreground opacity-0 shadow-2xl backdrop-blur-2xl transition-all active:!translate-y-0 hover:!border-white/40 hover:!bg-white hover:!text-black group-hover/carousel:pointer-events-auto group-hover/carousel:opacity-100 group-focus-within/carousel:pointer-events-auto group-focus-within/carousel:opacity-100 md:inline-flex md:size-12";

export function TopTenCarousel({ animes }: TopTenCarouselProps) {
  if (animes.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-5">
      <h2 className={HEADING_CLASS}>Top 10 Today</h2>

      <Carousel opts={{ align: "start", dragFree: true }} className="group/carousel w-full">
        <CarouselPrevious className={`!-left-2 ${NAV_BUTTON_CLASS}`} />

        <CarouselContent className="-ml-6">
          {animes.map((anime, index) => {
            const rank = index + 1;

            return (
              <CarouselItem
                key={anime.id}
                className="basis-[62%] pl-6 sm:basis-[44%] md:basis-[30%] lg:basis-[24%] xl:basis-[20%]"
              >
                <article className="relative flex items-end">
                  <span className="pointer-events-none absolute bottom-0 left-0 z-10 text-[5.5rem] font-black leading-[0.8] tracking-[-0.05em] text-muted-foreground/35 md:text-[6.75rem]">
                    {rank}
                  </span>

                  <AnimeCard
                    anime={anime}
                    priority={index < 4}
                    className="relative z-20 ml-8 w-[calc(100%-2rem)] md:ml-10 md:w-[calc(100%-2.5rem)]"
                  />
                </article>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        <CarouselNext className={`!-right-2 ${NAV_BUTTON_CLASS}`} />
      </Carousel>
    </section>
  );
}
