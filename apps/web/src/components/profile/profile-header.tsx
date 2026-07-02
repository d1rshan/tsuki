import Image from "next/image";
import type { UserOverview } from "@/lib/types";
import { Link as LinkIcon } from "lucide-react";

import { EditProfileDialog } from "./edit-profile-dialog";

type User = UserOverview["user"];
type Stats = UserOverview["stats"];
type Profile = UserOverview["profile"];

export function ProfileHeader({
  user,
  stats,
  profile,
  isOwner,
}: {
  user: User;
  stats: Stats;
  profile: Profile;
  isOwner: boolean;
}) {
  const banner = profile?.bannerImage;

  return (
    <div className="flex flex-col mb-8 border-b pb-8">
      {/* Banner */}
      {banner ? (
        <div className="w-full h-48 md:h-64 relative rounded-2xl overflow-hidden mb-6 shadow-sm border">
          <Image src={banner} alt="Banner" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
        </div>
      ) : (
        <div className="w-full h-32 md:h-48 rounded-2xl bg-gradient-to-tr from-muted/50 via-muted/20 to-muted/50 mb-6" />
      )}

      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start px-2">
        {/* Avatar */}
        <div className="relative -mt-16 md:-mt-20 ml-2 md:ml-6 shrink-0">
          <div className="w-24 h-24 md:w-32 md:h-32 relative rounded-full overflow-hidden ring-4 ring-background shadow-sm bg-muted border">
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
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col w-full pt-1">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {user.displayUsername || user.name}
              </h1>
              <p className="text-muted-foreground font-medium text-sm mt-0.5">@{user.username}</p>
            </div>
            {isOwner && (
              <div className="shrink-0">
                <EditProfileDialog profile={profile} />
              </div>
            )}
          </div>

          {profile?.bio && (
            <p className="mt-4 text-sm md:text-base text-foreground/80 max-w-2xl leading-relaxed whitespace-pre-wrap">
              {profile.bio}
            </p>
          )}

          {/* Social Links */}
          {profile?.socialLinks && Object.keys(profile.socialLinks).length > 0 && (
            <div className="flex flex-wrap gap-4 mt-5">
              {Object.entries(profile.socialLinks).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span className="capitalize">{platform}</span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex flex-row md:flex-col justify-start md:justify-center gap-6 md:gap-5 w-full md:w-auto md:min-w-[120px] pt-6 md:pt-2 shrink-0 md:border-l md:pl-6 border-border/50">
          <StatItem label="Anime" value={stats.totalAnime} />
          <StatItem label="Episodes" value={stats.episodesWatched} />
          <StatItem label="Mean Score" value={stats.meanScore.toFixed(1)} />
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
        {label}
      </span>
      <span className="text-xl font-bold tracking-tight text-foreground">{value}</span>
    </div>
  );
}
