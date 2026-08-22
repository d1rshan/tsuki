"use client";

import type { UserOverview } from "@tsuki/api/types";

import { HeatmapCalendar } from "@/shared/components/heatmap-calendar";
import { useIsMobile } from "@/shared/hooks/use-is-mobile";

import { activityDateKey, activityLevel, activityTooltip } from "../utils";

type ProfileActivity = UserOverview["activity"];

const LEVEL_VALUES = [0, 1, 3, 6, 11];

export function ProfileActivityHeatmap({ activity }: { activity: ProfileActivity }) {
  const latestDay = activity.days.at(-1);
  const isMobile = useIsMobile();

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Activity</h2>
      <HeatmapCalendar
        data={activity.days.map((day) => ({
          date: activityDateKey(day),
          value: LEVEL_VALUES[activityLevel(day.anime + day.manga)]!,
          meta: activityTooltip(day),
        }))}
        endDate={latestDay ? new Date(activityDateKey(latestDay)) : undefined}
        cellSize={11}
        cellGap={3}
        legend={false}
        rangeDays={isMobile ? 140 : 365}
        weekStartsOn={1}
        className="mx-auto w-fit max-w-full"
        levelClassNames={[
          "bg-muted",
          "bg-primary/20",
          "bg-primary/35",
          "bg-primary/55",
          "bg-primary/75",
        ]}
        renderTooltip={(cell) => cell.meta as string}
      />
    </section>
  );
}
