import Image from "next/image";
import type { UserOverview } from "@/lib/types";

type User = UserOverview["user"];
type Stats = UserOverview["stats"];

export function ProfileHeader({ user, stats }: { user: User; stats: Stats }) {
  return (
    <>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 to-transparent -z-10 pointer-events-none" />
      <div className="flex flex-col items-center text-center gap-6 mb-12">
        <ProfileAvatar user={user} />
        <UserInfo user={user} stats={stats} />
      </div>
    </>
  );
}

function ProfileAvatar({ user }: { user: User }) {
  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition duration-500" />
      <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0 overflow-hidden rounded-full ring-1 ring-border/50 shadow-xl bg-background">
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
