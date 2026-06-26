import { TrendingDown, TrendingUp, ShieldCheck, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trendValue: string;
  trendText: string;
  description: string;
};

function StatCard({ title, value, icon: Icon, trendValue, trendText, description }: StatCardProps) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {value}
        </CardTitle>
        <CardAction>
          <Badge variant="outline">
            <Icon className="size-4 mr-1" />
            {trendValue}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          {trendText} <Icon className="size-4" />
        </div>
        <div className="text-muted-foreground">{description}</div>
      </CardFooter>
    </Card>
  );
}

export function AdminDashboardStats({ totalUsers }: { totalUsers: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <StatCard
        title="Total Users"
        value={totalUsers}
        icon={TrendingUp}
        trendValue="+12.5%"
        trendText="Trending up this month"
        description="Registered users on the platform"
      />
      <StatCard
        title="Active Sessions"
        value="1,248"
        icon={TrendingDown}
        trendValue="-2%"
        trendText="Slight dip this hour"
        description="Normal daily fluctuation"
      />
      <StatCard
        title="New Signups"
        value="142"
        icon={TrendingUp}
        trendValue="+18%"
        trendText="Strong weekly growth"
        description="Driven by recent marketing"
      />
      <StatCard
        title="Server Uptime"
        value="99.99%"
        icon={ShieldCheck}
        trendValue="Stable"
        trendText="Systems operational"
        description="0 incidents reported"
      />
    </div>
  );
}
