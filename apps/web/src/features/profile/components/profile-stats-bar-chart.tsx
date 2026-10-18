"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart";

type StatsBarDatum = {
  label: string;
  value: number;
  detail?: string;
};

export function ProfileStatsBarChart({
  data,
  label,
  layout = "horizontal",
}: {
  data: StatsBarDatum[];
  label: string;
  layout?: "horizontal" | "vertical";
}) {
  const vertical = layout === "vertical";
  const config = {
    value: { label, color: "var(--primary)" },
  } satisfies ChartConfig;

  return (
    <>
      <ChartContainer
        config={config}
        className="w-full aspect-auto"
        style={{ height: vertical ? Math.max(200, data.length * 36) : 240 }}
      >
        <BarChart
          accessibilityLayer
          data={data}
          layout={layout}
          margin={{ top: 20, right: 28, bottom: 0, left: 0 }}
        >
          <CartesianGrid horizontal={!vertical} vertical={vertical} />
          {vertical ? (
            <>
              <XAxis type="number" hide allowDecimals={false} />
              <YAxis
                dataKey="label"
                type="category"
                width={100}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value: string) =>
                  value.length > 16 ? `${value.slice(0, 15)}…` : value
                }
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={4}
              />
              <YAxis hide allowDecimals={false} />
            </>
          )}
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                className="[&_.font-mono]:font-sans"
                labelFormatter={(value) =>
                  data.find((item) => item.label === String(value))?.detail ?? value
                }
              />
            }
          />
          <Bar dataKey="value" fill="var(--color-value)" radius={4} maxBarSize={32}>
            <LabelList
              dataKey="value"
              position={vertical ? "right" : "top"}
              className="fill-muted-foreground"
              fontSize={10}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
      <dl className="sr-only">
        {data.map((item) => (
          <div key={item.label}>
            <dt>{item.detail ?? item.label}</dt>
            <dd>
              {item.value} {label.toLowerCase()}
            </dd>
          </div>
        ))}
      </dl>
    </>
  );
}
