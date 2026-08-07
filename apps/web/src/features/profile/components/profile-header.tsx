import { ExternalLink } from "lucide-react";

import type { UserOverview } from "@tsuki/api/types";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

import { EditProfileDialog } from "./edit-profile-dialog";
import { ProfileTabs } from "./profile-tabs";

type ProfileHeaderProps = {
  isOwner: boolean;
  profile: UserOverview["profile"];
  stats: UserOverview["stats"];
  user: UserOverview["user"];
};

export function ProfileHeader({ isOwner, profile, stats, user }: ProfileHeaderProps) {
  return (
    <header className="mb-8 border-b pb-8">
      <div
        className="mb-6 h-36 w-full rounded-lg bg-muted bg-cover bg-center md:h-56"
        style={
          profile?.bannerImage ? { backgroundImage: `url(${profile.bannerImage})` } : undefined
        }
        role={profile?.bannerImage ? "img" : undefined}
        aria-label={profile?.bannerImage ? `${user.displayUsername}'s banner` : undefined}
      />

      <div className="grid gap-6 px-2 md:grid-cols-[auto_1fr_auto] md:gap-8">
        <div className="-mt-14 flex items-end justify-between md:-mt-20 md:block">
          <Avatar className="size-24 border-4 border-background shadow-sm md:size-32">
            {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
            <AvatarFallback className="text-3xl">
              {user.displayUsername.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {isOwner ? (
            <div className="md:hidden">
              <EditProfileDialog profile={profile} />
            </div>
          ) : null}
        </div>

        <div className="min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold md:text-3xl">
                {user.displayUsername || user.name}
              </h1>
              <p className="truncate text-sm font-medium text-primary">@{user.username}</p>
            </div>
            {isOwner ? (
              <div className="hidden md:block">
                <EditProfileDialog profile={profile} />
              </div>
            ) : null}
          </div>

          {profile?.bio ? (
            <p className="mt-4 max-w-2xl whitespace-pre-wrap text-sm leading-relaxed text-foreground/80 md:text-base">
              {profile.bio}
            </p>
          ) : null}

          <SocialLinks links={profile?.socialLinks} />
          <ProfileStats className="mt-6 md:hidden" stats={stats} />

          <div className="mt-8 overflow-x-auto">
            <ProfileTabs username={user.username} />
          </div>
        </div>

        <ProfileStats
          className="hidden min-w-28 border-l border-border/50 pl-6 md:flex"
          stats={stats}
        />
      </div>
    </header>
  );
}

function SocialLinks({ links }: { links?: Record<string, string> | null }) {
  if (!links || Object.keys(links).length === 0) return null;

  return (
    <div className="mt-5 flex flex-wrap gap-4">
      {Object.entries(links).map(([platform, url]) => (
        <a
          key={platform}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
        >
          <ExternalLink className="size-4" />
          <span className="capitalize">{platform}</span>
        </a>
      ))}
    </div>
  );
}

function ProfileStats({ className, stats }: { className?: string; stats: UserOverview["stats"] }) {
  const items = [
    ["Anime", stats.ANIME.total],
    ["Episodes", stats.ANIME.progress],
    ["Mean score", stats.ANIME.meanScore.toFixed(1)],
    ["Manga", stats.MANGA.total],
    ["Chapters", stats.MANGA.progress],
  ] as const;

  return (
    <div className={cn("flex flex-wrap gap-6 md:flex-col md:gap-4", className)}>
      {items.map(([label, value]) => (
        <div key={label} className="grid gap-0.5">
          <span className="text-xs font-semibold uppercase text-primary/80">{label}</span>
          <span className="text-xl font-bold tabular-nums">{value}</span>
        </div>
      ))}
    </div>
  );
}
