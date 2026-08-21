import Image from "next/image";
import Link from "next/link";
import { Link as LinkIcon } from "lucide-react";

import type { UserOverview } from "@tsuki/api/types";

import { EditProfileDialog } from "./edit-profile-dialog";
import { ProfileFollowButton } from "./profile-follow-button";
import { ProfileTabs } from "./profile-tabs";

type ProfileHeaderProps = {
  isOwner: boolean;
  profile: UserOverview["profile"];
  social: UserOverview["social"];
  stats: UserOverview["stats"];
  user: UserOverview["user"];
};

export function ProfileHeader({ isOwner, profile, social, stats, user }: ProfileHeaderProps) {
  const banner = profile?.bannerImage;

  return (
    <header className="mb-8 border-b pb-8">
      {banner ? (
        <div className="relative mb-6 h-48 w-full overflow-hidden rounded-2xl border shadow-sm md:h-64">
          <Image src={banner} alt="Banner" fill priority unoptimized className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
        </div>
      ) : (
        <div className="mb-6 h-32 w-full rounded-2xl bg-gradient-to-tr from-muted/50 via-muted/20 to-muted/50 md:h-48" />
      )}

      <div className="flex flex-col items-start gap-6 px-2 md:flex-row md:gap-8">
        <div className="relative -mt-16 ml-2 flex shrink-0 items-end justify-between md:-mt-20 md:ml-6 md:block">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border bg-muted ring-4 ring-background shadow-sm md:h-32 md:w-32">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name}
                fill
                priority
                sizes="(max-width: 768px) 96px, 128px"
                className="object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-3xl font-medium text-muted-foreground">
                {user.displayUsername.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {isOwner ? (
            <div className="mb-2 shrink-0 md:hidden">
              <EditProfileDialog profile={profile} />
            </div>
          ) : null}
        </div>

        <div className="flex w-full flex-1 flex-col pt-1">
          <div className="flex flex-row items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {user.displayUsername || user.name}
              </h1>
              <p className="mt-0.5 truncate text-sm font-medium text-primary">@{user.username}</p>
            </div>
            {isOwner ? (
              <div className="hidden shrink-0 md:block">
                <EditProfileDialog profile={profile} />
              </div>
            ) : (
              <ProfileFollowButton username={user.username} />
            )}
          </div>

          {profile?.bio ? (
            <p className="mt-4 max-w-2xl whitespace-pre-wrap text-sm leading-relaxed text-foreground/80 md:text-base">
              {profile.bio}
            </p>
          ) : null}

          <SocialLinks links={profile?.socialLinks} />

          <div className="mt-5 flex gap-5 text-sm">
            <Link href={`/${user.username}/followers`} className="hover:text-primary">
              <strong className="text-foreground">{social.followers}</strong>{" "}
              <span className="text-muted-foreground">followers</span>
            </Link>
            <Link href={`/${user.username}/following`} className="hover:text-primary">
              <strong className="text-foreground">{social.following}</strong>{" "}
              <span className="text-muted-foreground">following</span>
            </Link>
          </div>

          <div className="flex w-full flex-row flex-wrap gap-6 pt-6 md:hidden">
            <ProfileStats stats={stats} />
          </div>

          <div className="mt-8 mb-2 w-full">
            <ProfileTabs username={user.username} />
          </div>
        </div>
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
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <LinkIcon className="h-4 w-4" />
          <span className="capitalize">{platform}</span>
        </a>
      ))}
    </div>
  );
}

function ProfileStats({ stats }: { stats: UserOverview["stats"] }) {
  const items = [
    ["Anime", stats.ANIME.total],
    ["Episodes", stats.ANIME.progress],
    ["Mean Score", stats.ANIME.meanScore.toFixed(1)],
    ["Manga", stats.MANGA.total],
    ["Chapters", stats.MANGA.progress],
  ] as const;

  return items.map(([label, value]) => <StatItem key={label} label={label} value={value} />);
}

function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-semibold tracking-wider text-primary/80 uppercase">
        {label}
      </span>
      <span className="text-xl font-bold tracking-tight text-foreground">{value}</span>
    </div>
  );
}
