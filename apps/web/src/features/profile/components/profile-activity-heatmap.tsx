"use client";

import { cloneElement, useEffect, useState } from "react";
import { BookOpen, Flame, Tv } from "lucide-react";
import { useTheme } from "next-themes";
import { ActivityCalendar } from "react-activity-calendar";

import type { UserOverview } from "@tsuki/api/types";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/shared/components/content-state";

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
  const total = activity.totals.anime + activity.totals.manga;
  const tooltipsByDate = new Map(
    activity.days.map((day) => [activityDateKey(day), activityTooltip(day)]),
  );
  const calendarData = activity.days.map((day) => {
    const count = day.anime + day.manga;
    return { date: activityDateKey(day), count, level: activityLevel(count) };
  });

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold tracking-tight">Activity</h2>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Last 365 days</CardTitle>
            <CardDescription>Episode and chapter progress logged on Tsuki.</CardDescription>
          </div>
          <CardAction>
            <Badge variant="outline">
              <Flame />
              {activity.currentStreak} {activity.currentStreak === 1 ? "day" : "days"} streak
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              <Tv />
              {activity.totals.anime} {activity.totals.anime === 1 ? "episode" : "episodes"}
            </Badge>
            <Badge variant="secondary">
              <BookOpen />
              {activity.totals.manga} {activity.totals.manga === 1 ? "chapter" : "chapters"}
            </Badge>
          </div>

          {total > 0 ? (
            <div
              ref={scrollToLatestActivity}
              aria-label="Activity calendar, scroll horizontally to view earlier days"
              className="-mx-4 overflow-x-auto px-4 pb-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              role="region"
              tabIndex={0}
            >
              <div className="min-w-[49rem]">
                <ActivityCalendar
                  data={calendarData}
                  blockMargin={3}
                  blockRadius={3}
                  blockSize={11}
                  colorScheme={colorScheme}
                  fontSize={12}
                  labels={{ legend: { less: "Less", more: "More" } }}
                  renderBlock={(block, day) => {
                    const label = tooltipsByDate.get(day.date) ?? day.date;
                    return cloneElement(
                      block,
                      {
                        "aria-label": label,
                        role: "img",
                        tabIndex: day.count > 0 ? 0 : undefined,
                      },
                      <title>{label}</title>,
                    );
                  }}
                  showTotalCount={false}
                  showWeekdayLabels={["mon", "wed", "fri"]}
                  theme={CALENDAR_THEME}
                  weekStart={1}
                />
              </div>
            </div>
          ) : (
            <EmptyState
              title="No activity yet"
              description="Episode and chapter progress will appear here as it is logged."
            />
          )}
        </CardContent>
      </Card>
    </section>
  );
}
