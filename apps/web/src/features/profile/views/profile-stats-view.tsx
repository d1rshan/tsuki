import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  CheckCheck,
  Clapperboard,
  Clock3,
  Flame,
  Star,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import type { MediaType } from "@tsuki/api/types";

import { MEDIA } from "@/features/media/labels";
import { ContentState } from "@/shared/components/content-state";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

import { ProfileActivityHeatmap } from "../components/profile-activity-heatmap";
import { ProfileFilterLayout } from "../components/profile-filter-layout";
import { BENTO_TILE } from "../components/profile-section";
import { ProfileStatsBarChart } from "../components/profile-stats-bar-chart";
import { ProfileMonthlyChart, ProfileStatusChart } from "../components/profile-stats-charts";
import { getProfileOverview, getProfileStatistics } from "../data";
import { profileActivityStatistics } from "../stats";
import { searchParam, type ProfileSearchParams } from "../utils";

const number = new Intl.NumberFormat("en-US");
const score = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

function StatsTile({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-label={label}
      className={cn(BENTO_TILE, "min-w-0 flex flex-col gap-5", className)}
    >
      {children}
    </section>
  );
}

function Metric({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <dt className="flex shrink-0 items-center">
        <Tooltip>
          <TooltipTrigger
            type="button"
            aria-label={label}
            className="inline-flex items-center justify-center rounded-sm leading-none text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon className="size-5" strokeWidth={1.5} aria-hidden />
          </TooltipTrigger>
          <TooltipContent>{hint ?? label}</TooltipContent>
        </Tooltip>
      </dt>
      <dd className="min-w-0 flex-1 text-center text-xl leading-none tracking-tight tabular-nums">
        {value}
      </dd>
    </div>
  );
}

export async function ProfileStatsView({
  username,
  searchParams,
}: {
  username: string;
  searchParams: Promise<ProfileSearchParams>;
}) {
  const profile = await getProfileOverview(username);
  if (!profile) notFound();
  if (profile.locked) return null;
  const [statistics, params] = await Promise.all([getProfileStatistics(username), searchParams]);
  if (!statistics) notFound();

  const mediaType: MediaType = searchParam(params, "type") === "MANGA" ? "MANGA" : "ANIME";
  const stats = statistics[mediaType];
  const media = MEDIA[mediaType];
  const activity = profileActivityStatistics(profile.activity.days, mediaType);
  const statuses = [
    ...media.statuses.map((status) => ({
      ...status,
      count: stats.statuses.find((item) => item.status === status.value)?.count ?? 0,
    })),
    ...stats.statuses
      .filter((item) => item.status === "UNSET")
      .map((item) => ({
        value: "UNSET",
        label: "No status",
        count: item.count,
      })),
  ];

  return (
    <TooltipProvider>
      <ProfileFilterLayout
        label="Statistics media type"
        selected={mediaType}
        options={[
          { value: "ANIME", label: "Anime", href: `/${username}/stats` },
          { value: "MANGA", label: "Manga", href: `/${username}/stats?type=MANGA` },
        ]}
      >
        <div className="@container/stats flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 @min-[20rem]/stats:grid-cols-2 @min-[36rem]/stats:grid-cols-4">
            <StatsTile label="Completed titles" className="p-4 @min-[40rem]:p-4">
              <dl>
                <Metric
                  icon={CheckCheck}
                  label="Completed titles"
                  value={number.format(stats.completed)}
                />
              </dl>
            </StatsTile>
            <StatsTile
              label={mediaType === "ANIME" ? "Episodes watched" : "Chapters read"}
              className="p-4 @min-[40rem]:p-4"
            >
              <dl>
                <Metric
                  icon={mediaType === "ANIME" ? Clapperboard : BookOpen}
                  label={mediaType === "ANIME" ? "Episodes watched" : "Chapters read"}
                  value={number.format(stats.progress)}
                />
              </dl>
            </StatsTile>
            <StatsTile label="Mean score" className="p-4 @min-[40rem]:p-4">
              <dl>
                <Metric
                  icon={Star}
                  label="Mean score"
                  value={stats.meanScore === null ? "—" : `${score.format(stats.meanScore)}/10`}
                />
              </dl>
            </StatsTile>
            <StatsTile
              label={mediaType === "ANIME" ? "Estimated watch time" : "Active reading days"}
              className="p-4 @min-[40rem]:p-4"
            >
              <dl>
                {mediaType === "ANIME" ? (
                  <Metric
                    icon={Clock3}
                    label="Estimated watch time"
                    value={`${number.format(Math.round(stats.watchMinutes / 60))}h`}
                    hint={`Episode progress × known runtime. Runtime available for ${number.format(stats.runtimeKnownEpisodes)} of ${number.format(stats.progress)} episodes.`}
                  />
                ) : (
                  <Metric
                    icon={CalendarDays}
                    label="Active reading days"
                    value={number.format(activity.activeDays)}
                  />
                )}
              </dl>
            </StatsTile>
          </div>
          <div className="grid grid-cols-1 gap-4 @min-[40rem]/stats:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)]">
            <StatsTile label="Library status">
              {stats.total === 0 ? (
                <ContentState title="This library is empty" />
              ) : (
                <ProfileStatusChart statuses={statuses} />
              )}
            </StatsTile>

            <StatsTile label="Top genres">
              {stats.genres.length === 0 ? (
                <ContentState title="No genres to show yet" />
              ) : (
                <ProfileStatsBarChart
                  label="Titles"
                  layout="vertical"
                  data={stats.genres.map((item) => ({
                    label: item.genre,
                    value: item.count,
                    detail:
                      item.meanScore === null
                        ? item.genre
                        : `${item.genre} · ${score.format(item.meanScore)}/10`,
                  }))}
                />
              )}
            </StatsTile>
          </div>
          <StatsTile
            label="Activity over the last 365 days"
            className="@min-[48rem]/stats:grid @min-[48rem]/stats:grid-cols-[minmax(0,1fr)_max-content] @min-[48rem]/stats:items-center"
          >
            <ProfileActivityHeatmap
              activity={profile.activity}
              mediaType={mediaType}
              rangeDays={365}
              className="rounded-none border-0 bg-transparent p-0 @min-[40rem]:p-0"
            />
            <dl className="flex items-center justify-between gap-3 [&_dd]:flex-none [&_dd]:text-left [&_svg]:size-4 @min-[48rem]/stats:grid @min-[48rem]/stats:grid-cols-1 @min-[48rem]/stats:justify-self-end @min-[48rem]/stats:gap-5">
              <Metric
                icon={CalendarDays}
                label="Active days in the last 365 days"
                value={number.format(activity.activeDays)}
              />
              <Metric icon={Flame} label="Current streak" value={`${activity.currentStreak}d`} />
              <Metric
                icon={Trophy}
                label="Longest streak in the last 365 days"
                value={`${activity.longestStreak}d`}
              />
            </dl>
          </StatsTile>

          <StatsTile label={`Monthly ${media.unitLong.toLowerCase()}`}>
            {activity.activeDays === 0 ? (
              <ContentState title="No progress logged yet" />
            ) : (
              <ProfileMonthlyChart label={media.unitLong} months={activity.months} />
            )}
          </StatsTile>
        </div>
      </ProfileFilterLayout>
    </TooltipProvider>
  );
}
