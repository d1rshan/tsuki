"use client";

import * as React from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

export type HeatmapDatum = {
  date: string | Date;
  value: number;
  meta?: unknown;
};

export type HeatmapCell = {
  date: Date;
  key: string;
  value: number;
  level: number;
  label: string;
  disabled: boolean;
  meta?: unknown;
};

export type LegendConfig = {
  show?: boolean;
  lessText?: React.ReactNode;
  moreText?: React.ReactNode;
  showArrow?: boolean;
  placement?: "right" | "bottom";
  direction?: "row" | "column";
  showText?: boolean;
  swatchSize?: number;
  swatchGap?: number;
  className?: string;
};

export type AxisLabelsConfig = {
  show?: boolean;
  showWeekdays?: boolean;
  showMonths?: boolean;
  weekdayIndices?: number[];
  monthFormat?: "short" | "long" | "numeric";
  minWeekSpacing?: number;
  className?: string;
};

export type HeatmapCalendarProps = {
  data: HeatmapDatum[];
  rangeDays?: number;
  endDate?: Date;
  weekStartsOn?: 0 | 1;
  cellSize?: number;
  cellGap?: number;
  onCellClick?: (cell: HeatmapCell) => void;
  levelClassNames?: string[];
  palette?: string[];
  legend?: boolean | LegendConfig;
  axisLabels?: boolean | AxisLabelsConfig;
  renderLegend?: (args: {
    levelCount: number;
    levelClassNames: string[];
    palette?: string[];
    cellSize: number;
    cellGap: number;
  }) => React.ReactNode;
  renderTooltip?: (cell: HeatmapCell) => React.ReactNode;
  className?: string;
};

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setUTCHours(0, 0, 0, 0);
  return value;
}

function addDays(date: Date, days: number) {
  const value = new Date(date);
  value.setUTCDate(value.getUTCDate() + days);
  return value;
}

function toKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function startOfWeek(date: Date, weekStartsOn: 0 | 1) {
  const value = startOfDay(date);
  const difference = (value.getUTCDay() - weekStartsOn + 7) % 7;
  value.setUTCDate(value.getUTCDate() - difference);
  return value;
}

function getLevel(value: number) {
  if (value <= 0) return 0;
  if (value <= 2) return 1;
  if (value <= 5) return 2;
  if (value <= 10) return 3;
  return 4;
}

function clampLevel(level: number, levelCount: number) {
  return Math.max(0, Math.min(levelCount - 1, level));
}

function backgroundStyle(level: number, palette?: string[]) {
  if (!palette?.length) return undefined;
  return { backgroundColor: palette[clampLevel(level, palette.length)] };
}

function sameMonth(first: Date, second: Date) {
  return (
    first.getUTCFullYear() === second.getUTCFullYear() &&
    first.getUTCMonth() === second.getUTCMonth()
  );
}

function formatMonth(date: Date, format: "short" | "long" | "numeric") {
  if (format === "numeric") {
    return `${date.getUTCMonth() + 1}/${String(date.getUTCFullYear()).slice(-2)}`;
  }
  return date.toLocaleDateString(undefined, { month: format, timeZone: "UTC" });
}

function weekdayLabel(index: number, weekStartsOn: 0 | 1) {
  const date = new Date(Date.UTC(2024, 0, 7 + ((weekStartsOn + index) % 7)));
  return date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
}

export function HeatmapCalendar({
  data,
  rangeDays = 365,
  endDate = new Date(),
  weekStartsOn = 1,
  cellSize = 12,
  cellGap = 3,
  onCellClick,
  levelClassNames,
  palette,
  legend = true,
  axisLabels = true,
  renderLegend,
  renderTooltip,
  className,
}: HeatmapCalendarProps) {
  const levels = levelClassNames ?? [
    "bg-muted",
    "bg-primary/20",
    "bg-primary/35",
    "bg-primary/55",
    "bg-primary/75",
  ];
  const levelCount = palette?.length ?? levels.length;
  const legendConfig: LegendConfig =
    legend === true ? {} : legend === false ? { show: false } : legend;
  const axisConfig: AxisLabelsConfig =
    axisLabels === true ? {} : axisLabels === false ? { show: false } : axisLabels;
  const showAxis = axisConfig.show ?? true;
  const showWeekdays = axisConfig.showWeekdays ?? true;
  const showMonths = axisConfig.showMonths ?? true;
  const weekdayIndices = axisConfig.weekdayIndices ?? [1, 3, 5];
  const monthFormat = axisConfig.monthFormat ?? "short";
  const minWeekSpacing = axisConfig.minWeekSpacing ?? 3;

  const end = startOfDay(endDate);
  const start = addDays(end, -(rangeDays - 1));
  const values = React.useMemo(() => {
    const map = new Map<string, { value: number; meta?: unknown }>();
    for (const item of data) {
      const key = toKey(typeof item.date === "string" ? new Date(item.date) : item.date);
      const previous = map.get(key);
      map.set(key, {
        value: (previous?.value ?? 0) + item.value,
        meta: item.meta ?? previous?.meta,
      });
    }
    return map;
  }, [data]);

  const firstWeek = startOfWeek(start, weekStartsOn);
  const totalDays = Math.ceil((end.getTime() - firstWeek.getTime()) / 86400000) + 1;
  const weeks = Math.ceil(totalDays / 7);
  const columns = Array.from({ length: weeks }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => {
      const date = addDays(firstWeek, week * 7 + day);
      const disabled = date < start || date > end;
      const key = toKey(date);
      const entry = disabled ? undefined : values.get(key);
      const value = entry?.value ?? 0;
      return {
        date,
        key,
        value,
        level: clampLevel(disabled ? 0 : getLevel(value), levelCount),
        disabled,
        meta: entry?.meta,
        label: date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        }),
      } satisfies HeatmapCell;
    }),
  );
  const monthLabels = React.useMemo(() => {
    if (!showAxis || !showMonths) return [] as { index: number; text: string }[];
    let lastLabeledWeek = -minWeekSpacing;
    return columns.flatMap((column, index) => {
      const date = column.find((cell) => !cell.disabled)?.date ?? column[0]!.date;
      const previous = columns[index - 1];
      const previousDate = previous?.find((cell) => !cell.disabled)?.date ?? previous?.[0]?.date;
      if (
        (!previousDate || !sameMonth(date, previousDate)) &&
        index - lastLabeledWeek >= minWeekSpacing
      ) {
        lastLabeledWeek = index;
        return [{ index, text: formatMonth(date, monthFormat) }];
      }
      return [];
    });
  }, [columns, minWeekSpacing, monthFormat, showAxis, showMonths]);
  const legendConfigShow = legendConfig.show ?? true;
  const weekdayWidth = showAxis && showWeekdays ? 44 : 0;
  const tooltip = (cell: HeatmapCell) => {
    if (renderTooltip) return renderTooltip(cell);
    if (cell.disabled) return "Outside range";
    return `${cell.value} ${cell.value === 1 ? "event" : "events"} · ${cell.label}`;
  };
  const legendNode = renderLegend ? (
    renderLegend({ levelCount, levelClassNames: levels, palette, cellSize, cellGap })
  ) : !legendConfigShow ? null : (
    <div className={cn("min-w-35", legendConfig.className)}>
      {(legendConfig.showText ?? true) ? (
        <div className="mb-2 text-xs text-muted-foreground">
          {legendConfig.lessText ?? "Less"}{" "}
          {(legendConfig.showArrow ?? true) ? <span aria-hidden>→</span> : null}{" "}
          {legendConfig.moreText ?? "More"}
        </div>
      ) : null}
      <div
        className={cn(
          "flex items-center",
          (legendConfig.direction ?? "row") === "row" ? "flex-row" : "flex-col",
        )}
        style={{ gap: legendConfig.swatchGap ?? cellGap }}
      >
        {Array.from({ length: levelCount }, (_, index) => (
          <div
            key={index}
            className={cn(
              "rounded-[3px]",
              !palette?.length && levels[clampLevel(index, levels.length)],
            )}
            style={{
              width: legendConfig.swatchSize ?? cellSize,
              height: legendConfig.swatchSize ?? cellSize,
              ...backgroundStyle(index, palette),
            }}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className={className}>
      <TooltipProvider delay={80}>
        <div
          className={cn(
            "flex gap-4 overflow-x-auto",
            (legendConfig.placement ?? "right") === "bottom" && "flex-col",
          )}
        >
          <div className={cn("min-w-0", axisConfig.className)}>
            {showAxis && showMonths ? (
              <div className="flex items-end" style={{ paddingLeft: weekdayWidth }}>
                <div
                  className="relative"
                  style={{ height: 18, width: columns.length * (cellSize + cellGap) - cellGap }}
                >
                  {monthLabels.map((month) => (
                    <div
                      key={month.index}
                      className="absolute text-xs text-muted-foreground"
                      style={{ left: month.index * (cellSize + cellGap) }}
                    >
                      {month.text}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="flex">
              {showAxis && showWeekdays ? (
                <div className="mr-2 flex flex-col" style={{ gap: cellGap }} aria-hidden="true">
                  {Array.from({ length: 7 }, (_, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-end text-xs text-muted-foreground"
                      style={{ width: 40, height: cellSize }}
                    >
                      {weekdayIndices.includes(index) ? weekdayLabel(index, weekStartsOn) : ""}
                    </div>
                  ))}
                </div>
              ) : null}
              <div
                className="flex"
                style={{ gap: cellGap }}
                role="grid"
                aria-label="Heatmap calendar"
              >
                {columns.map((column, index) => (
                  <div
                    key={index}
                    className="flex flex-col"
                    style={{ gap: cellGap }}
                    role="rowgroup"
                  >
                    {column.map((cell) => (
                      <Tooltip key={`${cell.key}-${index}`}>
                        <TooltipTrigger
                          render={
                            <button
                              type="button"
                              disabled={cell.disabled}
                              onClick={() => !cell.disabled && onCellClick?.(cell)}
                              className={cn(
                                "rounded-[3px] outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                !palette?.length && levels[clampLevel(cell.level, levels.length)],
                                cell.disabled && "pointer-events-none cursor-default opacity-30",
                              )}
                              style={{
                                width: cellSize,
                                height: cellSize,
                                ...backgroundStyle(cell.level, palette),
                              }}
                              aria-label={
                                cell.disabled ? "Outside range" : `${cell.label}: ${cell.value}`
                              }
                              role="gridcell"
                            />
                          }
                        />
                        <TooltipContent side="top">{tooltip(cell)}</TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {legendNode}
        </div>
      </TooltipProvider>
    </div>
  );
}
