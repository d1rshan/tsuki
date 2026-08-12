"use client";

import { cloneElement } from "react";
import { BookOpen, Flame, Tv } from "lucide-react";
import { ActivityCalendar } from "react-activity-calendar";
import "react-activity-calendar/tooltips.css";

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

export function ProfileActivityHeatmap({ activity }: { activity: ProfileActivity }) {
  const total = activity.totals.anime + activity.totals.manga;
  const daysByDate = new Map(activity.days.map((day) => [activityDateKey(day), day]));
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
              {activity.currentStreak} day streak
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
            <div className="-mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:thin]">
              <div className="min-w-[47rem]">
                <ActivityCalendar
                  data={calendarData}
                  blockMargin={3}
                  blockRadius={3}
                  blockSize={11}
                  fontSize={12}
                  labels={{ legend: { less: "Less", more: "More" } }}
                  renderBlock={(block, day) => {
                    const label = activityTooltip(daysByDate.get(day.date)!);
                    return cloneElement(block, { "aria-label": label, role: "img" });
                  }}
                  showTotalCount={false}
                  showWeekdayLabels={["mon", "wed", "fri"]}
                  theme={CALENDAR_THEME}
                  tooltips={{
                    activity: {
                      text: (day) => activityTooltip(daysByDate.get(day.date)!),
                      withArrow: true,
                    },
                    colorLegend: { text: (level) => `Activity intensity ${level} of 4` },
                  }}
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
