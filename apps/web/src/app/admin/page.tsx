import { TrendingDown, TrendingUp, ShieldCheck } from "lucide-react";
import { userDal } from "@tsuki/db";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const users = await userDal.getAllUsers();
  const totalUsers = users.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black uppercase tracking-tighter">OVERVIEW</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4 dark:*:data-[slot=card]:bg-card">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {totalUsers}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <TrendingUp className="size-4 mr-1" />
                +12.5%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Trending up this month <TrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">Registered users on the platform</div>
          </CardFooter>
        </Card>
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Active Sessions</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              1,248
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <TrendingDown className="size-4 mr-1" />
                -2%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Slight dip this hour <TrendingDown className="size-4" />
            </div>
            <div className="text-muted-foreground">Normal daily fluctuation</div>
          </CardFooter>
        </Card>
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>New Signups</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              142
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <TrendingUp className="size-4 mr-1" />
                +18%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Strong weekly growth <TrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">Driven by recent marketing</div>
          </CardFooter>
        </Card>
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Server Uptime</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              99.99%
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <ShieldCheck className="size-4 mr-1" />
                Stable
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Systems operational <ShieldCheck className="size-4" />
            </div>
            <div className="text-muted-foreground">0 incidents reported</div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
