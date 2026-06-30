import Image from "next/image";
import type { UserOverview } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Edit2, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
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
  const accentColor = profile?.accentColor || "hsl(var(--primary))";

  return (
    <>
      <div
        className="absolute top-0 left-0 w-full h-64 md:h-80 -z-10 pointer-events-none bg-cover bg-center"
        style={{
          backgroundImage: banner
            ? `url(${banner})`
            : `radial-gradient(ellipse at top, ${accentColor}33, transparent)`,
          backgroundColor: banner ? "transparent" : "hsl(var(--background))",
        }}
      >
        {banner && (
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        )}
      </div>

      <div className="flex flex-col items-center text-center gap-6 mb-12 px-4">
        <ProfileAvatar user={user} accentColor={accentColor} />

        <div className="flex flex-col items-center max-w-2xl">
          <UserInfo user={user} stats={stats} />

          {profile?.bio && (
            <p className="mt-4 text-muted-foreground max-w-lg leading-relaxed whitespace-pre-wrap">
              {profile.bio}
            </p>
          )}

          {profile?.socialLinks && Object.keys(profile.socialLinks).length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {Object.entries(profile.socialLinks).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors bg-secondary/50 px-3 py-1.5 rounded-full"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span className="capitalize">{platform}</span>
                </a>
              ))}
            </div>
          )}

          {isOwner && (
            <div className="mt-6">
              <EditProfileDialog profile={profile} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ProfileAvatar({ user, accentColor }: { user: User; accentColor: string }) {
  return (
    <div className="relative group mt-12 md:mt-16">
      <div
        className="absolute -inset-1 rounded-full blur-md opacity-0 group-hover:opacity-100 transition duration-500"
        style={{ backgroundColor: `${accentColor}80` }}
      />
      <div
        className="relative w-32 h-32 md:w-40 md:h-40 shrink-0 overflow-hidden rounded-full ring-2 shadow-xl bg-background"
        style={{ borderColor: accentColor }}
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name}
            fill
            priority
            sizes="(max-width: 768px) 128px, 160px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-muted text-4xl font-light text-muted-foreground">
            {user.displayUsername.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}

function UserInfo({ user, stats }: { user: User; stats: Stats }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
        {user.displayUsername || user.name}
      </h1>
      <p className="text-muted-foreground text-base mt-1 font-medium">@{user.username}</p>

      <div className="flex justify-center gap-8 mt-6">
        <StatItem label="Anime" value={stats.totalAnime} />
        <StatItem label="Episodes" value={stats.episodesWatched} />
        <StatItem label="Mean Score" value={stats.meanScore.toFixed(1)} />
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col">
      <span className="text-2xl font-bold tracking-tight">{value}</span>
      <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">
        {label}
      </span>
    </div>
  );
}
