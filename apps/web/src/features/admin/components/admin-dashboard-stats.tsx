import { Users } from "lucide-react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminDashboardStats({ totalUsers }: { totalUsers: number }) {
  return (
    <div className="grid gap-4 md:max-w-sm">
      <Card className="shadow-xs">
        <CardHeader className="gap-3">
          <div className="flex items-center justify-between gap-4">
            <CardDescription>Total Users</CardDescription>
            <Users className="size-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-3xl font-semibold tabular-nums">{totalUsers}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
