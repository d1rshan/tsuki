"use client";

import { cloneElement, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ActivityCalendar } from "react-activity-calendar";

import type { UserOverview } from "@tsuki/api/types";

import { activityDateKey, activityLevel, activityTooltip } from "../activity";

type ProfileActivity = UserOverview["activity"];

const CALENDAR_THEME = {
  light: ["var(--muted)", "var(--primary)"],
  dark: ["var(--muted)", "var(--primary)"],
};

function scrollToLatestActivity(scrollContainer: HTMLDivElement | null) {
  if (scrollContainer) scrollContainer.scrollLeft = scrollContainer.scrollWidth;
}

export function ProfileActivityHeatmap({ activity }: { activity: ProfileActivity }) {
  const { resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const colorScheme = isMounted && resolvedTheme === "dark" ? "dark" : "light";
  const labelsByDate = new Map(
    activity.days.map((day) => [activityDateKey(day), activityTooltip(day)]),
  );
  const calendarData = activity.days.map((day) => {
    const count = day.anime + day.manga;
    return { date: activityDateKey(day), count, level: activityLevel(count) };
  });

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Activity</h2>
      <div
        ref={scrollToLatestActivity}
        aria-label="Activity over the last 365 days; scroll horizontally to view earlier days"
        className="-mx-4 overflow-x-auto px-4 pb-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        role="region"
        tabIndex={0}
      >
        <div className="flex min-w-[49rem] justify-center">
          <ActivityCalendar
            data={calendarData}
            blockMargin={3}
            blockRadius={3}
            blockSize={11}
            colorScheme={colorScheme}
            fontSize={12}
            labels={{ legend: { less: "Less", more: "More" } }}
            renderBlock={(block, day) => {
              const label = labelsByDate.get(day.date) ?? day.date;
              return cloneElement(block, {
                "aria-label": label,
                role: "img",
                tabIndex: day.count > 0 ? 0 : undefined,
              });
            }}
            showTotalCount={false}
            showWeekdayLabels={["mon", "wed", "fri"]}
            theme={CALENDAR_THEME}
            weekStart={1}
          />
        </div>
      </div>
    </section>
  );
}
