import { Suspense } from "react";

import type { LucideIcon } from "lucide-react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";

type AdminDashboardStatsCardProps = {
  label: string;
  icon: LucideIcon;
  value: () => string | number | Promise<string | number>;
};

export function AdminDashboardStatsCard({
  label,
  icon: Icon,
  value,
}: AdminDashboardStatsCardProps) {
  return (
    <Card className="bg-gradient-to-t from-primary/5 to-card shadow-xs dark:bg-card">
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-4">
          <CardDescription>{label}</CardDescription>
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <CardTitle className="text-3xl font-semibold tabular-nums" aria-live="polite">
          <Suspense fallback="X">{value()}</Suspense>
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
