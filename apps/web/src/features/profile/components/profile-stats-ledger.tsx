"use client";

import { Pie, PieChart } from "recharts";

import type { UserOverview } from "@tsuki/api/types";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart";
import { cn } from "@/shared/lib/utils";

import { BENTO_TILE } from "./profile-section";

type ProfileStats = UserOverview["stats"];

// ponytail: manga/chapters used --secondary, which is near-invisible on card surfaces in light themes
const chartConfig = {
  anime: { label: "Anime", color: "var(--primary)" },
  manga: { label: "Manga", color: "var(--muted-foreground)" },
  episodes: { label: "Episodes", color: "var(--primary)" },
  chapters: { label: "Chapters", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

/** Stacked donut: inner disk = anime/manga counts, outer ring = episodes/chapters. */
export function ProfileStatsLedger({
  stats,
  className,
}: {
  stats: ProfileStats;
  className?: string;
}) {
  const innerData = [
    { label: "anime", value: stats.ANIME.total, fill: "var(--color-anime)" },
    { label: "manga", value: stats.MANGA.total, fill: "var(--color-manga)" },
  ];
  const outerData = [
    { label: "episodes", value: stats.ANIME.progress, fill: "var(--color-episodes)" },
    { label: "chapters", value: stats.MANGA.progress, fill: "var(--color-chapters)" },
  ];

  return (
    <div className={cn(BENTO_TILE, "flex items-center justify-center", className)}>
      <ChartContainer config={chartConfig} className="mx-auto aspect-square w-full max-w-32">
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent hideLabel nameKey="label" className="[&_.font-mono]:font-sans" />
            }
          />
          <Pie data={innerData} dataKey="value" nameKey="label" outerRadius="50%" />
          <Pie
            data={outerData}
            dataKey="value"
            nameKey="label"
            innerRadius="62%"
            outerRadius="85%"
          />
        </PieChart>
      </ChartContainer>
    </div>
  );
}
