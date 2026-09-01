"use client";

import { useEffect, useRef, useState } from "react";

import type { UserOverview } from "@tsuki/api/types";

import { HeatmapCalendar } from "@/shared/components/heatmap-calendar";
import { cn } from "@/shared/lib/utils";

import { activityDateKey, activityLevel, activityTooltip } from "../utils";
import { BENTO_CARD } from "./profile-section";

type ProfileActivity = UserOverview["activity"];

const LEVEL_VALUES = [0, 1, 3, 6, 11];
const CELL = 11;
const GAP = 3;
const MIN_WEEKS = 10;
/** Default before the ResizeObserver reports. */
const DEFAULT_WEEKS = 26;

/**
 * The activity heatmap as a bento tile: no title, day range derived from the
 * tile's measured width so the calendar fills it edge to edge.
 */
export function ProfileActivityHeatmap({
  activity,
  className,
}: {
  activity: ProfileActivity;
  className?: string;
}) {
  const latestDay = activity.days.at(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => setWidth(entries[0]!.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const weeks = width ? Math.max(MIN_WEEKS, Math.floor((width - 6) / (CELL + GAP))) : DEFAULT_WEEKS;

  return (
    <section className={cn(BENTO_CARD, "flex flex-col p-4 sm:p-6", className)}>
      <div ref={containerRef} className="flex min-h-28 flex-1 items-center">
        <HeatmapCalendar
          data={activity.days.map((day) => ({
            date: activityDateKey(day),
            value: LEVEL_VALUES[activityLevel(day.anime + day.manga)]!,
            meta: activityTooltip(day),
          }))}
          endDate={latestDay ? new Date(activityDateKey(latestDay)) : undefined}
          cellSize={CELL}
          cellGap={GAP}
          legend={false}
          axisLabels={false}
          rangeDays={weeks * 7}
          weekStartsOn={1}
          className="w-full"
          levelClassNames={[
            "bg-muted",
            "bg-primary/20",
            "bg-primary/35",
            "bg-primary/55",
            "bg-primary/75",
          ]}
          renderTooltip={(cell) => cell.meta as string}
        />
      </div>
    </section>
  );
}
