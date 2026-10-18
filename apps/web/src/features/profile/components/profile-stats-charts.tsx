"use client";

import { Area, AreaChart, CartesianGrid, Label, Pie, PieChart, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart";

const statusColors = [
  "var(--primary)",
  "var(--muted-foreground)",
  "color-mix(in oklch, var(--primary) 65%, var(--background))",
  "color-mix(in oklch, var(--primary) 40%, var(--foreground))",
  "color-mix(in oklch, var(--muted-foreground) 60%, var(--background))",
  "color-mix(in oklch, var(--primary) 80%, var(--foreground))",
  "var(--foreground)",
];

export function ProfileStatusChart({
  statuses,
}: {
  statuses: { value: string; label: string; count: number }[];
}) {
  const config = Object.fromEntries(
    statuses.map((item, index) => [
      item.value,
      { label: item.label, color: statusColors[index % statusColors.length] },
    ]),
  ) satisfies ChartConfig;
  const data = statuses
    .filter((item) => item.count > 0)
    .map((item) => ({
      ...item,
      fill: `var(--color-${item.value})`,
    }));
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <>
      <ChartContainer config={config} className="mx-auto h-64 w-full aspect-auto">
        <PieChart accessibilityLayer>
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent nameKey="value" hideLabel className="[&_.font-mono]:font-sans" />
            }
          />
          <Pie
            data={data}
            dataKey="count"
            nameKey="value"
            innerRadius="58%"
            outerRadius="80%"
            paddingAngle={data.length > 1 ? 3 : 0}
            cornerRadius={5}
            strokeWidth={0}
          >
            <Label
              content={({ viewBox }) => {
                if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null;
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan x={viewBox.cx} className="fill-foreground text-3xl font-semibold">
                      {total}
                    </tspan>
                    <tspan x={viewBox.cx} dy={24} className="fill-muted-foreground text-xs">
                      titles
                    </tspan>
                  </text>
                );
              }}
            />
          </Pie>
          <ChartLegend
            content={<ChartLegendContent nameKey="value" className="flex-wrap gap-x-3 gap-y-1" />}
          />
        </PieChart>
      </ChartContainer>
      <dl className="sr-only">
        {statuses.map((item) => (
          <div key={item.value}>
            <dt>{item.label}</dt>
            <dd>{item.count} titles</dd>
          </div>
        ))}
      </dl>
    </>
  );
}

export function ProfileMonthlyChart({
  months,
  label,
}: {
  months: { key: string; label: string; amount: number }[];
  label: string;
}) {
  const config = {
    amount: { label, color: "var(--primary)" },
  } satisfies ChartConfig;

  return (
    <>
      <ChartContainer config={config} className="h-56 w-full aspect-auto">
        <AreaChart
          accessibilityLayer
          data={months}
          margin={{ top: 16, right: 8, bottom: 0, left: 0 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} />
          <YAxis hide allowDecimals={false} />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent className="[&_.font-mono]:font-sans" />}
          />
          <Area
            type="linear"
            dataKey="amount"
            stroke="var(--color-amount)"
            fill="var(--color-amount)"
            fillOpacity={0.15}
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--color-amount)", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ChartContainer>
      <dl className="sr-only">
        {months.map((month) => (
          <div key={month.key}>
            <dt>{month.label}</dt>
            <dd>
              {month.amount} {label.toLowerCase()}
            </dd>
          </div>
        ))}
      </dl>
    </>
  );
}
